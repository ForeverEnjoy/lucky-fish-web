import { DummyVertex } from './dummy-vertex';
import { Edge, Vertex, VertexIdType } from './graph-entity';

export class Graph {
    public edges: Edge[];
    public vertexIdSet: Set<string> = new Set<string>();

    constructor(edges: Edge[]) {
        this.edges = edges
        for (let edge of edges) {
            this.vertexIdSet.add(edge.from)
            this.vertexIdSet.add(edge.to)
        }
    }

    public getOutEdges(vertex: string): Edge[] {
        return this.edges.filter(e => e.from === vertex);
    }

    public getInEdges(vertex: string): Edge[] {
        return this.edges.filter(e => e.to === vertex);
    }

    public addEdge(edge: Edge) {
        this.edges.push(edge);
        this.vertexIdSet.add(edge.from)
        this.vertexIdSet.add(edge.to)
    }
}

export class VertexOrderer {
    public orderVertexes(graph: Graph, vertexIdTypeLayers: string[][]): string[][] {
        let nodeLayers = this.convertToOrderVertexesNode(vertexIdTypeLayers);
        // nodeLayers.forEach(layer => {
        //     layer.forEach(v => {
        //         graph.getOutEdges(v.id).forEach(e => {
        //             v.out.push(e.to);
        //         });
        //     })
        // })

        for (let i = 1; i < nodeLayers.length; ++i) {
            nodeLayers[i].sort((a, b) => {
                return a.inWeight/(a.inNodes.length+1)- b.inWeight/(b.inNodes.length+1)
            });
            let tmpArr = [];
            nodeLayers[i].forEach(v => {
                tmpArr.push(v);
            });
            console.log('layers in @@', i, tmpArr);
            if (i == nodeLayers.length - 1) {
                break;
            }
            for (let j = 0; j < nodeLayers[i].length; ++j) {
                let node = nodeLayers[i][j];
                graph.getOutEdges(node.id).forEach(edge => {
                    let to = edge.to;
                    let nextIndex = nodeLayers[i + 1].findIndex(nextNode => nextNode.id == to);
                    let nextNode = nodeLayers[i+1][nextIndex];
                    nextNode.inWeight += j;
                    node.outNodes.push(nextNode);
                    nextNode.inNodes.push(node);
                });
                // for (let k = 0; k < node.out.length; ++k) {
                //     let to = node.out[k];
                //     let nextIndex = nodeLayers[i + 1].findIndex(nextNode => nextNode.id == to);
                //     let nextNode = nodeLayers[i+1][nextIndex];
                //     nextNode.inWeight += j;
                //     node.outNodes.push(nextNode);
                //     nextNode.inNodes.push(node);
                // }
            }
        }

        for (let i = nodeLayers.length - 1; i >= 0; --i) {
            nodeLayers[i].sort((a, b) => a.outWeight/(a.outNodes.length+1.0) - b.outWeight/(b.outNodes.length+1.0));
            let tmpArr = [];
            nodeLayers[i].forEach(v => {
                tmpArr.push(v.id);
            });
            console.log('layers out @@', i, tmpArr);

            if (i < 1) {
                break;
            }

            for (let j = 0; j < nodeLayers[i].length; ++j) {
                let node = nodeLayers[i][j];
                for (let k = 0; k < node.inNodes.length; ++k) {
                    node.inNodes[k].outWeight += j;
                }
            }
        }

        let result = [];
        for (let i = 0; i < nodeLayers.length; ++i) {
            let row = [];
            for (let j = 0; j < nodeLayers[i].length; ++j) {
                row.push(nodeLayers[i][j].id);
            }
            result.push(row);
        }
        return result;
    }

    public convertToOrderVertexesNode(inLayers: VertexIdType[][]): OrderVertexesNode[][] {
        let outLayers = [];
        inLayers.forEach(inLayer => {
            let row = [];
            inLayer.forEach(vertex => {
                let node = new OrderVertexesNode();
                node.id = vertex;
                row.push(node);
            });
            outLayers.push(row);
        })
        return outLayers;
    }

    public convertToVertexIdType(inLayers: OrderVertexesNode[][]): VertexIdType[][] {
        let outLayers = [];
        inLayers.forEach(inLayer => {
            let row = [];
            inLayer.forEach(v=> {
                row.push(v.id);
            });
            outLayers.push(row);
        })
        return outLayers;
    }
}

export class OrderVertexesNode {
    public id: string;
    public out: string[] = [];
    public inWeight: number = 0;
    public outWeight: number = 0;
    public outNodes: OrderVertexesNode[] = [];
    public inNodes: OrderVertexesNode[] = [];
}

export class PosNode {
    public id: string;
    public x: number;
    public y: number;
    public width: number = 50;
    public height: number = 50;

    constructor(id: string) {
        this.id = id;
    }
}