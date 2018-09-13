import { Component, Input, OnInit } from '@angular/core';

import { Graph, PosNode, VertexOrder } from './graph';
import { DummyVertex } from './dummy-vertex';
import { FlowChartManager } from 'app/flowchart/flowchart-manager';
import { VertexIdType } from 'app/flowchart/graph-entity';
import { GraphData } from 'app/flowchart/data';

export class Point {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static zero(): Point {
        return new Point(0, 0);
    }
}

export enum SegmentType {
    Normal = 1,
    Ray = 2
}

export class Segment {
    public a: Point;
    public b: Point;
    public type: SegmentType = SegmentType.Normal;

    constructor(a: Point, b: Point) {
        this.a = a;
        this.b = b;
    }
}

@Component({
    selector: 'flowchart',
    template: `
        <div class="comp-wrapper
                    percent-100-wh
                    h-center-aligner">
            <div class="flex-column-aligner
                        h-center-aligner
                        percent-100-w">
                <svg [style.width.px]="svgWidthPx"
                     [style.height.px]="svgHeightPx">
                    <defs> 
                        <marker id="arrow" refX="6" refY="3"
                                markerWidth="6" markerHeight="6"
                                orient="auto-start-reverse">
                            <path d="M 0 0 L 6 3 L 0 6 z" />
                        </marker>
                    </defs>

                    <g *ngFor="let seg of segments">
                            <g *ngIf="seg.type === SegmentType.Ray">
                                <line [attr.x1]="seg.a.x"
                                      [attr.y1]="seg.a.y"
                                      [attr.x2]="seg.b.x"
                                      [attr.y2]="seg.b.y"
                                      [style.stroke]="'rgb(99,99,99)'"
                                      [style.stroke-width]="2"
                                      marker-end="url(#arrow)"/>
                            </g>
                            <g *ngIf="seg.type === SegmentType.Normal">
                                <line [attr.x1]="seg.a.x"
                                      [attr.y1]="seg.a.y"
                                      [attr.x2]="seg.b.x"
                                      [attr.y2]="seg.b.y"
                                      [style.stroke]="'rgb(99,99,99)'"
                                      [style.stroke-width]="2"/>
                            </g>
                    </g>
                    
                    <!--node-->
                    <g *ngFor="let chart of flowchartManager.charts;let rowIndex=index">
                        <g *ngFor="let v of chart; let columnIndex=index">
                            <g *ngIf="DummyVertex.isDummyVertex(v.id)">
                                <line [attr.x1]="v.x + v.width / 2"
                                      [attr.y1]="v.y + v.height / 2"
                                      [attr.x2]="v.x + v.width / 2"
                                      [attr.y2]="v.y + v.height / 2"
                                      [style.stroke]="'rgb(99,99,99)'"
                                      [style.stroke-width]="3"/>
                                <g *ngIf="isShowDummyNode">
                                    <rect [attr.x]="v.x"
                                          [attr.y]="v.y"
                                          [attr.width]="v.width"
                                          [attr.height]="v.height"
                                          [style.stroke-width]="1"
                                          [style.stroke]="'white'"/>
                                    <text [attr.x]="v.x + v.width / 2"
                                          [attr.y]="v.y + v.height / 2"
                                          font-size="10.00"
                                          fill="white"
                                          text-anchor="middle"
                                          dominant-baseline="middle">
                                        {{v.id}}
                                    </text>
                                </g>
                            </g>

                            <g *ngIf="!DummyVertex.isDummyVertex(v.id)">
                                <rect [attr.x]="v.x" 
                                      [attr.y]="v.y" 
                                      [attr.width]="v.width" 
                                      [attr.height]="v.height"
                                      [style.fill]="'rgb(255, 255, 255)'"
                                      [style.stroke-width]="1"
                                      [style.stroke]="'rgb(0, 0, 0)'"/>
                                <text [attr.x]="v.x + v.width / 2" 
                                      [attr.y]="v.y + v.height / 2"
                                      font-size="10.00" 
                                      fill="black"
                                      text-anchor="middle" 
                                      dominant-baseline="middle">
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
        'app/flowchart/flowchart.sizer.css',
        'app/flowchart/flowchart.css',
    ]
})

export class FlowchartComponent implements OnInit {
    // declare for use in template
    public DummyVertex = DummyVertex;
    public SegmentType = SegmentType;

    // config
    @Input()
    public isShowDummyNode = false;

    //
    public flowchartManager: FlowChartManager;
    public segments: Segment[] = [];
    public svgWidthPx = 500;
    public svgHeightPx = 300;

    @Input()
    public graph: Graph = new Graph([]);

    public ngOnInit() {
       this.flowchartManager = new FlowChartManager(this.graph);
       this.flowchartManager.layout();

       this.segments = [];
       this.graph.edges.forEach(e => {
           if (e.isReversed) {
               e.reverse();
           }
           let from = this.getNode(e.from);
           let to = this.getNode(e.to);

           let a = new Point(from.x + from.width / 2, from.y + from.height / 2);
           let b = new Point(to.x + to.width / 2, to.y + to.height / 2);
           let seg: Segment;
           if (DummyVertex.isDummyVertex(to.id)) {
               seg = new Segment(a, b);
           } else {
               let rectangle = [
                   new Point(to.x, to.y),
                   new Point(to.x + to.width, to.y),
                   new Point(to.x + to.width, to.y + to.height),
                   new Point(to.x, to.y + to.height),
               ];
               let p = this.segmentCrossPolygon(a, b, rectangle);
               seg = new Segment(a, p);
               seg.type = SegmentType.Ray;
           }
           this.segments.push(seg);
       });

       // calculate svg size
       this.flowchartManager.vertexNodeMap.forEach((v, k) => {
           this.svgWidthPx = Math.max(this.svgHeightPx, v.x + v.width + 20);
           this.svgHeightPx = Math.max(this.svgHeightPx, v.y + v.height + 20);
       });
    }

    public getNode(id: VertexIdType): PosNode {
        return this.flowchartManager.vertexNodeMap.get(id);
    }

    public segmentCrossPolygon(a: Point, b: Point, polygon: Point[]): Point {
        if (null === polygon || polygon.length < 2) {
            return Point.zero();
        }

        for (let i = 0; i < polygon.length; ++i) {
            let p = this.segmentsIntersection(a, b, polygon[i], polygon[(i + 1)%polygon.length]);
            if (null !== p) {
                return p;
            }
        }
        return Point.zero();
    }

    public segmentsIntersection(a: Point, b: Point, c: Point, d: Point): Point {

        /** 1 解线性方程组, 求线段交点. **/
            // 如果分母为0 则平行或共线, 不相交
        let denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
        if (denominator == 0) {
            return null;
        }

        // 线段所在直线的交点坐标 (x , y)
        let x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
            + (b.y - a.y) * (d.x - c.x) * a.x
            - (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
        let y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
            + (b.x - a.x) * (d.y - c.y) * a.y
            - (d.x - c.x) * (b.y - a.y) * c.y) / denominator;

        /** 2 判断交点是否在两条线段上 **/
        if (
            // 交点在线段1上
            (x - a.x) * (x - b.x) <= 0 && (y - a.y) * (y - b.y) <= 0
            // 且交点也在线段2上
            && (x - c.x) * (x - d.x) <= 0 && (y - c.y) * (y - d.y) <= 0
        ) {
            return new Point(x, y);
        }
        //否则不相交
        return null;
    }
}




