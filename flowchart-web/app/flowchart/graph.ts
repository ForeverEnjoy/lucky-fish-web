import { DummyVertex } from './dummy-vertex';
import { Edge } from './graph-entity';

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
            this._layers[i].sort((a, b) => a.outWeight/(a.outNodes.length+1.0) - b.outWeight/(b.outNodes.length+1.0));
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
    public out: number[] = [];
    public inWeight: number = 0;
    public outWeight: number = 0;
    public outNodes: Node[] = [];
    public inNodes: Node[] = [];
}