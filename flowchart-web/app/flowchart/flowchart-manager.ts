import { Edge, VertexIdType, VertexType } from 'app/flowchart/graph-entity';
import { DummyVertex } from 'app/flowchart/dummy-vertex';
import { Graph, PosNode, VertexOrder } from 'app/flowchart/graph';

export class FlowChartManager {
    private readonly deltX = 50;
    private readonly deltY = 50;
    private readonly vertexWidth = 30;
    private readonly vertexHeight = 20;
    private readonly beginX = 30;
    private readonly beginY = 30;

    private readonly graph: Graph;

    constructor(graph: Graph) {
        this.graph = graph;
    }

    public charts = [];
    public vertexNodeMap: Map<VertexIdType, PosNode> = new Map<VertexIdType, PosNode>();
    public vertexPositionMap: Map<VertexIdType, number> = new Map<VertexIdType, number>();
    public precede: Map<VertexIdType, VertexIdType> = new Map<VertexIdType, VertexIdType>();

    private layers = [];
    public layout() {
        this.removeCycles();
        this.layers = this.assignLayers();

        // insert dummy vertex
        this.insertDummyVertexes();

        this.layers = VertexOrder.orderVertexes(this.graph, this.layers);

        for (let i = 0; i < this.layers.length; ++i) {
            for (let j = 0; j < this.layers[i].length; ++j) {
                let id = this.layers[i][j];
                this.vertexPositionMap.set(id, j);
                if (j > 0) {
                    this.precede.set(id, this.layers[i][j-1]);
                }
            }
        }
        console.log('layers', this.layers);
        console.log('pred', this.precede);

        this.preprocessingType0();
        this.preprocessingType1();
        this.verticalAlignment();
        // console.log('root', this.root);
        // console.log('align', this.align);
        this.horizontalCompaction();

        this.charts = [];
        let sumy = this.beginY;
        for (let i = 0; i < this.layers.length; ++i) {
            let row = [];
            for (let j = 0; j < this.layers[i].length; ++j)  {
                let node = new PosNode(this.layers[i][j]);
                node.x = this.vertexX.get(node.id) + this.beginX;
                node.y = sumy;
                node.width = this.vertexWidth;
                node.height = this.vertexHeight;
                this.vertexNodeMap.set(node.id, node);
                row.push(node);
            }
            sumy += this.deltY + this.vertexHeight;
            this.charts.push(row);
        }
        console.log('final charts', this.charts);
    }

    // ---------------------------------- remove cycles ----------------------------------
    private removeCycles() {
        let stack: Set<VertexIdType> = new Set<VertexIdType>();
        let visited: Set<VertexIdType> = new Set<VertexIdType>();
        this.graph.vertexIdSet.forEach(vertex => {
            this.dfsRemove(vertex, stack, visited);
        });
    }

    private dfsRemove(vertexId: VertexIdType, stack: Set<VertexIdType>, visited: Set<VertexIdType>) {
        if (visited.has(vertexId)) {
            return
        }
        visited.add(vertexId)
        stack.add(vertexId)
        for (let edge of this.graph.getOutEdges(vertexId)) {
            if (stack.has(edge.to)) {
                edge.reverse();
            } else {
                this.dfsRemove(edge.to, stack, visited)
            }
        }
        stack.delete(vertexId);
    }

    // assignLayers
    private assignLayers(): string[][] {
        let levels = [];

        let inMap = new Map<string, number>();
        this.graph.vertexIdSet.forEach(v => inMap.set(v, 0));

        this.graph.edges.forEach(e => inMap.set(e.to, inMap.get(e.to) + 1));

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

            this.graph.edges.forEach(e => {
                if (arr.findIndex(v => e.from === v) >= 0) {
                    inMap.set(e.to, inMap.get(e.to) - 1);
                }
            });

            arr.forEach(v => {
                inMap.delete(v);
            })
            levels.push(arr);
        }

        return levels;
    }

    //插入虚拟结点
    public insertDummyVertexes() {
        for (let i = 0; i < this.layers.length - 1; ++i) {
            for (let j = 0; j < this.layers[i].length; ++j) {
                let u = this.layers[i][j];
                let outEdges = this.graph.getOutEdges(u);
                outEdges.forEach(e => {
                    if (this.layers[i + 1].findIndex(v => e.to == v) < 0) {
                        let dummyVertex = DummyVertex.Create();
                        let newEdge = new Edge(dummyVertex, e.to);
                        e.to = dummyVertex;
                        if (e.isReversed) {
                            newEdge.isReversed = true;
                        }
                        this.graph.addEdge(newEdge);
                        this.layers[i+1].push(dummyVertex);
                    }
                });
            }
        }
    }

    private preprocessingType0() {
        for (let i = 0;  i < this.layers.length; ++i) {
            for (let j = 0; j < this.layers[i].length; ++j) {
                if (i > 0) {
                    let edges = this.graph.getInEdges(this.layers[i][j]);
                    if (edges.length > 2) {
                        edges.sort((a, b) => this.vertexPositionMap.get(a.from) - this.vertexPositionMap.get(b.from));
                        for (let k = 0; k < edges.length; ++k) {
                            if (k != Math.floor((edges.length - 1) / 2) && k != Math.floor(edges.length / 2)) {
                                edges[k].type = 0;
                            }
                        }
                    }
                }
                if (i < this.layers.length - 1) {
                    let edges = this.graph.getOutEdges(this.layers[i][j]);
                    if (edges.length > 2) {
                        edges.sort((a, b) => this.vertexPositionMap.get(a.to) - this.vertexPositionMap.get(b.to));
                        for (let k = 0; k < edges.length; ++k) {
                            if (k != Math.floor((edges.length - 1) / 2) && k != Math.floor(edges.length / 2)) {
                                edges[k].type = 0;
                            }
                        }
                    }
                }
            }
        }
    }

    private preprocessingType1() { // Alg. 1: Preprocessing (mark type 1 conflicts)
        for (let i = 1;  i < this.layers.length - 1; ++i) {
            let k0 = -1, l = 0;
            for (let l1 = 0; l1 < this.layers[i+1].length; ++l1) {
                let isInnerSegment = false;
                let upperNeighbor = '';
                if (l1 != this.layers[i + 1].length - 1) {
                    let edges = this.graph.getInEdges(this.layers[i+1][l1]);
                    edges.forEach(e => {
                        if (DummyVertex.isDummyVertex(e.from) && DummyVertex.isDummyVertex(e.to)) {
                            isInnerSegment = true;
                            upperNeighbor = e.from;
                        }
                    })
                    if (!isInnerSegment) {
                        continue;
                    }
                }

                let k1 = this.layers[i].length - 1;
                if (isInnerSegment) {
                    k1 = this.vertexPositionMap.get(upperNeighbor);
                }

                while(l <= l1) {
                    let edges = this.graph.getInEdges(this.layers[i+1][l]);
                    edges.forEach(e => {
                        let k = this.vertexPositionMap.get(e.from);
                        if (k < k0 || k > k1) {
                            e.type = 1;
                        }
                    });
                    l++;
                }

                k0 = k1;
            }
        }
    }

    private root = new Map<VertexIdType, VertexIdType>();
    private align = new Map<VertexIdType, VertexIdType>();
    private verticalAlignment() {
        this.graph.vertexIdSet.forEach(v => {
            this.root.set(v, v);
            this.align.set(v, v);
        });

        for (let i = 0; i < this.layers.length; ++i) {
            let r = -1;
            for (let k = 0; k < this.layers[i].length; ++k) {
                let v = this.layers[i][k];
                let edges = this.graph.getInEdges(v);
                if (edges.length == 0) {
                    continue;
                }

                edges.sort((a, b) => this.vertexPositionMap.get(a.from) - this.vertexPositionMap.get(b.from));

                let mArr = [Math.floor(edges.length / 2)];
                if (edges.length % 2 === 0) {
                    mArr.push(Math.floor((edges.length - 1) / 2));
                }

                mArr.forEach(m => {
                    if (this.align.get(v) == v) {
                        let u = edges[m].from;
                        if (edges[m].type == -1 && r < this.vertexPositionMap.get(edges[m].from)) {
                            this.align.set(u, v);
                            this.root.set(v, this.root.get(u));
                            this.align.set(v, this.root.get(v));
                            r = this.vertexPositionMap.get(u);
                        }
                    }
                });
            }
        }
    }

    public vertexX: Map<VertexIdType, number> = new Map<VertexIdType, number>();
    private placeBlock(v: string) {
        if (this.vertexX.has(v))  {
            return ;
        }

        this.vertexX.set(v, 0);
        let w = v;
        do {
            if (this.vertexPositionMap.get(w) > 0) {
                let u = this.root.get(this.precede.get(w));
                this.placeBlock(u);
                if (this.sink.get(v) == v) {
                    this.sink.set(v, this.sink.get(u));
                }
                if (this.sink.get(v) != this.sink.get(u)) {
                    let tmp = Math.min(this.shift.get(this.sink.get(u)), this.vertexX.get(v) - this.vertexX.get(u) - (this.deltX + this.vertexWidth));
                    this.shift.set(this.sink.get(u), tmp);
                } else {
                    let tmp = Math.max(this.vertexX.get(v), this.vertexX.get(u) + (this.deltX + this.vertexWidth));
                    this.vertexX.set(v, tmp);
                }
            }
            w = this.align.get(w);
        } while (w != v);
    }

    private sink = new Map<VertexIdType, VertexIdType>();
    private shift = new Map<VertexIdType, number>();
    private readonly INF: number = 10000000;
    private horizontalCompaction() {
        this.graph.vertexIdSet.forEach(v => {
            this.sink.set(v, v);
            this.shift.set(v, this.INF);
        });

        this.graph.vertexIdSet.forEach(v => {
            if (this.root.get(v) == v) {
                this.placeBlock(v);
            }
        });

        this.graph.vertexIdSet.forEach(v => {
            this.vertexX.set(v, this.vertexX.get(this.root.get(v)));
            let ssrv = this.shift.get(this.sink.get(this.root.get(v)));
            if (ssrv < this.INF) {
                this.vertexX.set(v, this.vertexX.get(v) + ssrv);
            }
        });
        console.log('horizontalCompaction x', this.vertexX);
    }
}