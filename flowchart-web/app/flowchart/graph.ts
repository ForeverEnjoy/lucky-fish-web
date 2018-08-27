import { DummyVertex } from './dummy-vertex';

export class Graph {
    public edges: Edge[];
    public vertices: Set<number> = new Set<number>();

    constructor(edges: Edge[]) {
        this.edges = edges
        for (let edge of edges) {
            this.vertices.add(edge.from)
            this.vertices.add(edge.to)
        }
    }

    public getOutEdges(vertex: number): Edge[] {
        return this.edges.filter(e => e.from === vertex);
    }

    public getInEdges(vertex: number): Edge[] {
        return this.edges.filter(e => e.to === vertex);
    }

    public addEdge(edge: Edge) {
        this.edges.push(edge);
        this.vertices.add(edge.from)
        this.vertices.add(edge.to)
    }

    // ---------------------------------- remove cycles ----------------------------------
    private _stack: Set<number> = new Set<number>();
    private _visited: Set<number> = new Set<number>();
    public removeCycles() {
        this._visited.clear();
        this._stack.clear();
        this.vertices.forEach(vertex => {
            this.dfsRemove(vertex);
        });
    }

    private dfsRemove(vertex: number) {
        if (this._visited.has(vertex)) {
            return
        }
        this._visited.add(vertex)
        this._stack.add(vertex)
        for (let edge of this.getOutEdges(vertex)) {
            if (this._stack.has(edge.to)) {
                edge.reverse();
            } else {
                this.dfsRemove(edge.to)
            }
        }
        this._stack.delete(vertex);
    }

    // 分层 并 插入虚拟结点
    public level: number[][] = [];
    public assignLayers(): number[][] {
        const sorted = [];

        let inMap = new Map<number, number>();
        this.edges.forEach(e => {
            if (inMap.has(e.to)) {
                inMap.set(e.to, inMap.get(e.to) + 1)
            } else {
                inMap.set(e.to, 1);
            }
            if (!inMap.has(e.from)) {
                inMap.set(e.from, 0);
            }
        });

        while(true) {
            let arr = [];
            inMap.forEach((value, key) => {
                if (value == 0)  {
                    arr.push(key);
                }
            });

            if (arr.length == 0) {
                break;
            }

            this.edges.forEach(e => {
                if (arr.findIndex(v => e.from === v) >= 0) {
                    inMap.set(e.to, inMap.get(e.to) - 1);
                }
            });

            arr.forEach(v => {
                inMap.delete(v);
            })
            sorted.push(arr);
        }


        // console.log(JSON.parse(JSON.stringify(sorted)));
        for (let i = 0; i < sorted.length - 1; ++i) {
            for (let j = 0; j < sorted[i].length; ++j) {
                let u = sorted[i][j];
                let outEdges = this.getOutEdges(u);
                outEdges.forEach(e => {
                    if (sorted[i + 1].findIndex(v => e.to == v) < 0) {
                        let dummyVertex = DummyVertex.Create();
                        let newEdge = new Edge(dummyVertex, e.to);
                        e.to = dummyVertex;
                        this.addEdge(newEdge);
                        sorted[i+1].push(dummyVertex);
                    }
                });
            }
        }

        return sorted;
    }
}

export class Edge {
    public from: number;
    public to: number;
    public label: string;
    public type: number;
    public isReversed: boolean;

    constructor(from: number, to: number) {
        this.from = from;
        this.to = to;
        this.label = null;
        this.type = -1;
        this.isReversed = false;
    }

    public equals(other: Edge): boolean {
        return this.from === other.from
            && this.to === other.to
            && this.label === other.label;
    }

    public reverse() {
        let from = this.from; //swap arrow
        this.from= this.to;
        this.to = from;
        this.isReversed = !this.isReversed;
    }
}

export class VertexOrderer {
    private _graph: Graph;
    private _layers: Node[][] = [];
    private virtualNow = 1000;
    constructor(graph: Graph, numLayers: number[][]) {
        this._graph = graph;
        this._layers = [];
        numLayers.forEach(numLayer => {
            let row = [];
            numLayer.forEach(num => {
                let node = new Node();
                node.id = num;
                row.push(node);
            });
            this._layers.push(row);
        })
    }

    public orderVertexes(): Node[][] {
        let result = [];

        this._layers.forEach(layer => {
            layer.forEach(t => {
                this._graph.getOutEdges(t.id).forEach(e => {
                    t.out.push(e.to);
                });
            })
        })
        let nextVirtual = [];
        for (let i = 0; i < this._layers.length; ++i) {
            this._layers[i].push(...nextVirtual);
            this._layers[i].sort((a, b) => a.inWeight/(a.inNodes.length+1)- b.inWeight/(b.inNodes.length+1));
            if (i == this._layers.length - 1) {
                break;
            }
            nextVirtual = [];
            for (let j = 0; j < this._layers[i].length; ++j) {
                let node = this._layers[i][j];
                for (let k = 0; k < node.out.length; ++k) {
                    let to = node.out[k];
                    let nextIndex = this._layers[i + 1].findIndex(nextNode => nextNode.id == to);
                    let nextNode = this._layers[i+1][nextIndex];
                    nextNode.inWeight += j;
                    node.outNodes.push(nextNode);
                    nextNode.inNodes.push(node);
                }
            }
        }

        for (let i = this._layers.length - 1; i >= 0; --i) {
            this._layers[i].sort((a, b) => a.outWeight/(a.outNodes.length+1.0)- b.outWeight/(b.outNodes.length+1.0));
            if (i < 1) {
                break;
            }

            for (let j = 0; j < this._layers[i].length; ++j) {
                let node = this._layers[i][j];
                for (let k = 0; k < node.inNodes.length; ++k) {
                    node.inNodes[k].outWeight += j;
                }
            }
        }
        this.show();
        return this._layers;
    }

    public show() {
        for (let i = 0; i < this._layers.length; ++i) {
            console.log(this._layers[i]);
            let row = [];
            for (let j = 0; j < this._layers[i].length; ++j) {
                let node = this._layers[i][j];
                row.push(node.id);
            }
            // console.log('row  ', i + 1, '   : ', row);
        }
    }
}

export class Node {
    public x: number;
    public y: number;
    public width: number = 50;
    public height: number = 50;
    public id: number;
    public type: number = 0;
    public out: number[] = [];
    public inWeight: number = 0;
    public outWeight: number = 0;
    public outNodes: Node[] = [];
    public inNodes: Node[] = [];
}