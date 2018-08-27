import { Component, OnInit } from '@angular/core';

import { DataEdges } from './data';
import { Graph, VertexOrderer, Node } from './graph';
import { DummyVertex } from './dummy-vertex';

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
                        傻鱼娜的流程图
                    </div>
                </div>
            </div>
            
            <div class="w-50-pc
                        flex-column-aligner">
                <div *ngFor="let layer of layers; let index=index"
                     class="flex-row-aligner">
                    <div class="green-color">{{index}} &nbsp;:&nbsp; </div>
                    <div class="flex-row-aligner"
                         *ngFor="let vertex of layer">
                        <div> {{vertex}} &nbsp;&nbsp;</div>
                    </div>
                </div> 
            </div>
            <div class="flex-column-aligner
                        h-center-aligner
                        percent-100-w">
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height: 1000px; width: 90%">
                    <g *ngFor="let chart of charts;let rowIndex=index">
                        <g *ngFor="let v of chart; let columnIndex=index">
                            <g *ngIf="isDummyVertex(v.id)">
                                <!--<line [attr.x1]="v.x + v.width / 2" [attr.y1]="v.y"-->
                                      <!--[attr.x2]="v.x + v.width / 2" [attr.y2]="v.y + v.height"-->
                                      <!--style="stroke:rgb(99,99,99);stroke-width:2"/>-->
                                <rect [attr.x]="v.x" 
                                      [attr.y]="v.y" 
                                      [attr.width]="v.width" 
                                      [attr.height]="v.height"
                                      style="stroke-width:1;stroke:white"/>
                                <text text-anchor="start" 
                                      [attr.x]="v.x + 10" 
                                      [attr.y]="v.y + 20" 
                                      font-family="Open Sans, Noto Sans SC, Noto Sans TC, Noto Sans JP, Noto Sans KR"
                                      font-size="10.00" 
                                      fill="white">{{v.id}}</text>
                            </g>

                            <g *ngIf="!isDummyVertex(v.id)">
                                <rect [attr.x]="v.x" 
                                      [attr.y]="v.y" 
                                      [attr.width]="v.width" 
                                      [attr.height]="v.height"
                                      style="fill:blue;stroke-width:1;stroke:rgb(0,0,0)"/>
                                <text text-anchor="start" 
                                      [attr.x]="v.x + 10" 
                                      [attr.y]="v.y + 20" 
                                      font-family="Open Sans, Noto Sans SC, Noto Sans TC, Noto Sans JP, Noto Sans KR" 
                                      font-size="10.00" fill="white">{{v.id}}</text>
                            </g>
                            <!--<g *ngIf="rowIndex < charts.length - 1">-->
                                <!--<g *ngFor="let nextNode of v.outNodes">-->
                                    <!--<line [attr.x1]="v.x + v.width / 2" [attr.y1]="v.y + v.height"-->
                                          <!--[attr.x2]="nextNode.x + v.width / 2" [attr.y2]="nextNode.y"-->
                                          <!--style="stroke:rgb(99,99,99);stroke-width:2"/>-->
                                <!--</g>-->
                            <!--</g>-->
                            <g *ngIf="rowIndex < charts.length - 1">
                                <g *ngFor="let edge of graph.getOutEdges(v.id)">
                                    <g *ngIf="edge.type == -1">
                                        <line [attr.x1]="v.x + v.width / 2" [attr.y1]="v.y + v.height"
                                              [attr.x2]="vertexNodeMap.get(edge.to).x + v.width / 2" 
                                              [attr.y2]="vertexNodeMap.get(edge.to).y"
                                              style="stroke:rgb(99,99,99);stroke-width:2"/>
                                    </g>
                                </g>
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

    public ngOnInit() {
       let g = new Graph(DataEdges);
       this.graph = g;
       g.removeCycles();
       this.layers = g.assignLayers();

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
           }
           this.layers.push(arr);
       }
       console.log(this.layers);

       this.preprocessingType0();
       this.preprocessingType1();
       console.log(this.graph.edges);

       let sumy = 0;
       for (let i = 0; i < ov.length; ++i) {
           let sumx = 0;
           for (let j = 0; j < ov[i].length; ++j)  {
               let node = ov[i][j];
               node.x = sumx;
               node.y = sumy;
               node.width = 35;
               node.height = 25;
               sumx += 35 + 50;
           }
           sumy += 25 + 50;
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

    public preprocessingType2() {
    }

    public root = new Map<number, number>();
    public align = new Map<number, number>();
    VerticalAlignment() {
    }
}



