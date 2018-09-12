import { Component, OnInit } from '@angular/core';

import { DataEdges } from './data';
import { Graph, VertexOrderer, Node } from './graph';
import { DummyVertex } from './dummy-vertex';
import { FlowChartManager } from 'app/flowchart/flowchart-manager';

@Component({
    selector: 'flowchart',
    template: `
        <div class="comp-wrapper
                    percent-100-wh
                    h-center-aligner">
            <div class="percent-100-wh
                        white-bg
                        h-center-aligner"> 
                <div class="percent-100-w
                            max-w-0
                            v-center-aligner
                            brief-wrapper-h">
                    <div class="font-type-2"> 
                        <!--傻鱼娜的流程图-->
                    </div>
                </div>
            </div>
            
            <div class="w-50-pc
                        flex-column-aligner">
                <div *ngFor="let layer of layers; let index=index"
                     class="flex-row-aligner">
                    <div class="green-color">
                        {{index}} &nbsp;:&nbsp; 
                    </div>
                    <div class="flex-row-aligner"
                         *ngFor="let vertex of layer">
                        <div> 
                            {{vertex}} &nbsp;&nbsp;
                        </div>
                    </div>
                </div> 
            </div>
            
            <div class="flex-column-aligner
                        h-center-aligner
                        percent-100-w">
                <svg style="height: 1000px; width: 90%">

                    <defs> 
                        <marker id="arrow" refX="6" refY="3"
                                markerWidth="6" markerHeight="6"
                                orient="auto-start-reverse">
                            <path d="M 0 0 L 6 3 L 0 6 z" />
                        </marker>
                    </defs>
                    <g *ngFor="let chart of charts;let rowIndex=index">
                        <g *ngFor="let v of chart; let columnIndex=index">
                            <g *ngIf="rowIndex < charts.length - 1">
                                <g *ngFor="let edge of graph.getOutEdges(v.id)">
                                    <!--<g *ngIf="edge.type == -1">-->
                                    <g *ngIf="!isDummyVertex(edge.to)">
                                        <line [attr.x1]="v.x + v.width / 2"
                                              [attr.y1]="v.y + v.height / 2"
                                              [attr.x2]="vertexNodeMap.get(edge.to).x + v.width / 2"
                                              [attr.y2]="vertexNodeMap.get(edge.to).y + v.height / 2"
                                              [style.stroke]="'rgb(99,99,99)'"
                                              [style.stroke-width]="2"
                                              marker-end="url(#arrow)"/>
                                    </g>
                                    <g *ngIf="isDummyVertex(edge.to)">
                                        <line [attr.x1]="v.x + v.width / 2"
                                              [attr.y1]="v.y + v.height / 2"
                                              [attr.x2]="vertexNodeMap.get(edge.to).x + v.width / 2"
                                              [attr.y2]="vertexNodeMap.get(edge.to).y + v.height / 2"
                                              [style.stroke]="'rgb(99,99,99)'"
                                              [style.stroke-width]="2"/>
                                    </g>
                                    <!--</g>-->
                                </g>
                            </g>
                            
                            <g *ngIf="isDummyVertex(v.id)">
                                <line [attr.x1]="v.x + v.width / 2"
                                      [attr.y1]="v.y + v.height / 2"
                                      [attr.x2]="v.x + v.width / 2"
                                      [attr.y2]="v.y + v.height / 2"
                                      [style.stroke]="'rgb(99,99,99)'"
                                      [style.stroke-width]="3"/>
                                <!--<rect [attr.x]="v.x" -->
                                      <!--[attr.y]="v.y" -->
                                      <!--[attr.width]="v.width" -->
                                      <!--[attr.height]="v.height"-->
                                      <!--style="stroke-width:1;stroke:white"/>-->
                                <!--<text text-anchor="start" -->
                                      <!--[attr.x]="v.x + 5" -->
                                      <!--[attr.y]="v.y + 13" -->
                                      <!--font-size="10.00" -->
                                      <!--fill="white">{{v.id}}</text>-->
                            </g>

                            <g *ngIf="!isDummyVertex(v.id)">
                                <rect [attr.x]="v.x" 
                                      [attr.y]="v.y" 
                                      [attr.width]="v.width" 
                                      [attr.height]="v.height"
                                      [style.fill]="'rgb(255, 255, 255)'"
                                      [style.stroke-width]="1"
                                      [style.stroke]="'rgb(0, 0, 0)'"/>
                                <text text-anchor="start" 
                                      [attr.x]="v.x + 5" 
                                      [attr.y]="v.y + 13" 
                                      font-size="10.00" 
                                      fill="black">
                                    {{v.id}}
                                </text>
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
        </div>
    `,
    styleUrls: [
        'app/flowchart/flowchart.aligner.css',
        'app/flowchart/flowchart.sizer.css',
        'app/flowchart/flowchart.css',
    ]
})

export class FlowchartComponent implements OnInit {
    public layers = [];
    public charts = [];
    public graph: Graph;
    public vertexNodeMap: Map<number, Node> = new Map<number, Node>();
    public vertexPosMap: Map<number, number> = new Map<number, number>();
    public pred: Map<number, number> = new Map<number, number>();

    public ngOnInit() {
       let g = new Graph(DataEdges);
       this.graph = g;
       let flowchartManager = new FlowChartManager(g);
       flowchartManager.removeCycles();
       this.layers = flowchartManager.assignLayers();

       let order = new VertexOrderer(g, this.layers);
       let ov = order.orderVertexes();

       this.layers = [];
       for (let i = 0; i < ov.length; ++i) {
           let arr = [];
           for (let j = 0; j < ov[i].length; ++j) {
               let node = ov[i][j];
               arr.push(node.id);
               this.vertexNodeMap.set(node.id, node);
               this.vertexPosMap.set(node.id, j);
               if (j > 0) {
                   this.pred.set(node.id, ov[i][j-1].id);
               }
           }
           this.layers.push(arr);
       }
       console.log('layers', this.layers);
       console.log('pred', this.pred);

       this.preprocessingType0();
       this.preprocessingType1();
       console.log(this.graph.edges);
       this.verticalAlignment();
       console.log('root', this.root);
       console.log('align', this.align);
       this.horizontalCompaction();

       let sumy = 0;
       for (let i = 0; i < ov.length; ++i) {
           let sumx = 0;
           for (let j = 0; j < ov[i].length; ++j)  {
               let node = ov[i][j];
               // node.x = sumx;
               node.x = this.x.get(node.id);
               node.y = sumy;
               node.width = 30;
               node.height = 20;
               sumx += 30 + 50;
           }
           sumy += 20 + 50;
       }
       this.charts = ov;
       // console.log('layerAssignment ', result);
    }

    public isDummyVertex(v: number): boolean {
        return v >= 1000;
    }

    public preprocessingType1() { // Alg. 1: Preprocessing (mark type 1 conflicts)
        for (let i = 1;  i < this.layers.length - 1; ++i) {
            let k0 = -1, l = 0;
            for (let l1 = 0; l1 < this.layers[i+1].length; ++l1) {
                let isInnerSegment = false;
                let upperNeighbor = 0;
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
                    // k1 = this.layers[i].findIndex(v => (v == upperNeighbor));
                    k1 = this.vertexPosMap.get(upperNeighbor);
                }
                console.log('inner segment', upperNeighbor, this.layers[i+1][l1], ' k0 ', k0, ' k1 = ', k1, ' l = ', l, ' l1 = ', l1);

                while(l <= l1) {
                    let edges = this.graph.getInEdges(this.layers[i+1][l]);
                    edges.forEach(e => {
                        // let k = this.layers[i].findIndex(v => (v == e.from));
                        let k = this.vertexPosMap.get(e.from);
                        if (k < k0 || k > k1) {
                            e.type = 1;
                            console.log('type 1 edge', e);
                        }
                    });
                    l ++;
                }

                k0 = k1;
            }
        }
    }

    public root = new Map<number, number>();
    public align = new Map<number, number>();
    public verticalAlignment() {
        this.graph.vertices.forEach(v => {
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

                edges.sort((a, b) => this.vertexPosMap.get(a.from) - this.vertexPosMap.get(b.from));

                let mArr = [Math.floor(edges.length / 2)];
                if (edges.length % 2 === 0) {
                    mArr.push(Math.floor((edges.length - 1) / 2));
                }

                mArr.forEach(m => {
                    if (this.align.get(v) == v) {
                        let u = edges[m].from;
                        console.log('---------', r, u, v, edges[m]);
                        if (edges[m].type == -1 && r < this.vertexPosMap.get(edges[m].from)) {
                            this.align.set(u, v);
                            this.root.set(v, this.root.get(u));
                            this.align.set(v, this.root.get(v));
                            r = this.vertexPosMap.get(u);
                        }
                    }
                });
            }
        }
    }

    public preprocessingType0() {
        for (let i = 0;  i < this.layers.length; ++i) {
            for (let j = 0; j < this.layers[i].length; ++j) {
                if (i > 0) {
                    let edges = this.graph.getInEdges(this.layers[i][j]);
                    if (edges.length > 2) {
                        edges.sort((a, b) => this.vertexPosMap.get(a.from) - this.vertexPosMap.get(b.from));
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
                        edges.sort((a, b) => this.vertexPosMap.get(a.to) - this.vertexPosMap.get(b.to));
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


    public x: Map<number, number> = new Map<number, number>();
    public readonly delt = 30 + 50;
    public placeBlock(v: number) {
        // console.log('placeBlock ', v, this.x.has(v));
        if (this.x.has(v))  {
            return ;
        }

        this.x.set(v, 0);
        let w = v;
        do {
            // console.log("w ", w);

            if (this.vertexPosMap.get(w) > 0) {
                let u = this.root.get(this.pred.get(w));
                this.placeBlock(u);
                if (this.sink.get(v) == v) {
                    this.sink.set(v, this.sink.get(u));
                }
                if (this.sink.get(v) != this.sink.get(u)) {
                    let tmp = Math.min(this.shift.get(this.sink.get(u)), this.x.get(v) - this.x.get(u) - this.delt);
                    this.shift.set(this.sink.get(u), tmp);
                } else {
                    // console.log('before placeBlock set x tmp ', v, this.x.get(v), u, this.x.get(u), w);
                    let tmp = Math.max(this.x.get(v), this.x.get(u) + this.delt);
                    this.x.set(v, tmp);
                    // console.log('after placeBlock set x tmp ', v, this.x.get(v));
                }
            }
            w = this.align.get(w);
        } while (w != v);
    }

    public sink = new Map<number, number>();
    public shift = new Map<number, number>();
    public readonly INF: number = 10000000;
    public horizontalCompaction() {
        this.graph.vertices.forEach(v => {
            this.sink.set(v, v);
            this.shift.set(v, this.INF);
        });

        this.graph.vertices.forEach(v => {
            if (this.root.get(v) == v) {
                this.placeBlock(v);
            }
        });

        this.graph.vertices.forEach(v => {
            this.x.set(v, this.x.get(this.root.get(v)));
            let ssrv = this.shift.get(this.sink.get(this.root.get(v)));
            if (ssrv < this.INF) {
                this.x.set(v, this.x.get(v) + ssrv);
                // console.log('horizontalCompaction set x ', v, this.x.get(v));
            }
        });
        console.log('horizontalCompaction x', this.x);
    }
}



