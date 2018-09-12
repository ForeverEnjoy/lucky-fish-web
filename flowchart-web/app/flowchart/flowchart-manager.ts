import { Edge } from 'app/flowchart/graph-entity';
import { DummyVertex } from 'app/flowchart/dummy-vertex';
import { Graph } from 'app/flowchart/graph';

export class FlowChartManager {
    private graph: Graph;

    constructor(graph: Graph) {
        this.graph = graph;
    }

    // ---------------------------------- remove cycles ----------------------------------
    private _stack: Set<string> = new Set<string>();
    private _visited: Set<string> = new Set<string>();
    public removeCycles() {
        this._visited.clear();
        this._stack.clear();
        this.graph.vertexIdSet.forEach(vertex => {
            this.dfsRemove(vertex);
        });
    }

    private dfsRemove(vertex: string) {
        if (this._visited.has(vertex)) {
            return
        }
        this._visited.add(vertex)
        this._stack.add(vertex)
        for (let edge of this.graph.getOutEdges(vertex)) {
            if (this._stack.has(edge.to)) {
                edge.reverse();
            } else {
                this.dfsRemove(edge.to)
            }
        }
        this._stack.delete(vertex);
    }

    // 分层 并 插入虚拟结点
    public levels: string[][] = [];
    public assignLayers(): string[][] {
        this.levels = [];

        let inMap = new Map<string, number>();
        this.graph.vertexIdSet.forEach(v => {
            inMap.set(v, 0);
        })

        this.graph.edges.forEach(e => {
            inMap.set(e.to, inMap.get(e.to) + 1)
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

            this.graph.edges.forEach(e => {
                if (arr.findIndex(v => e.from === v) >= 0) {
                    inMap.set(e.to, inMap.get(e.to) - 1);
                }
            });

            arr.forEach(v => {
                inMap.delete(v);
            })
            this.levels.push(arr);
        }


        // console.log(JSON.parse(JSON.stringify(sorted)));
        // insert dummy vertex
        this.insertDummyVertexes();

        return this.levels;
    }

    public insertDummyVertexes() {
        for (let i = 0; i < this.levels.length - 1; ++i) {
            for (let j = 0; j < this.levels[i].length; ++j) {
                let u = this.levels[i][j];
                let outEdges = this.graph.getOutEdges(u);
                outEdges.forEach(e => {
                    if (this.levels[i + 1].findIndex(v => e.to == v) < 0) {
                        let dummyVertex = DummyVertex.Create();
                        let newEdge = new Edge(dummyVertex, e.to);
                        e.to = dummyVertex;
                        this.graph.addEdge(newEdge);
                        this.levels[i+1].push(dummyVertex);
                    }
                });
            }
        }
    }
}