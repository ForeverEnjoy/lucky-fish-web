import { Component, OnInit } from '@angular/core';

import { Graph, PosNode, VertexOrder } from './graph';
import { DummyVertex } from './dummy-vertex';
import { FlowChartManager } from 'app/flowchart/flowchart-manager';
import { VertexIdType } from 'app/flowchart/graph-entity';
import { GraphData } from 'app/flowchart/data';

@Component({
    selector: 'flowcharts',
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
                    <div class="w-20-px">
                    </div>
                    <div class="hover-pointer
                                btn"
                         [style.width.px]="152"
                         (click)="isShowDummyNode = !isShowDummyNode">
                        {{isShowDummyNode ? 'Hide Dummy Node' : 'Show Dummy Node'}}
                    </div>
                </div>
            </div>
            
            <div class="flex-column-aligner
                        h-center-aligner
                        percent-100-w">
                <ng-container *ngFor="let g of graphs">
                    <flowchart [graph]="g"
                               [isShowDummyNode]="isShowDummyNode">
                    </flowchart>
                    <hr class="percent-100-w green-bg">
                </ng-container>
            </div>
        </div>
    `,
    styleUrls: [
        'app/flowchart/flowchart.sizer.css',
        'app/flowchart/flowcharts.css',
    ]
})

export class FlowchartsComponent implements OnInit {
    public isShowDummyNode = false;

    public graphs = [];
    public ngOnInit() {
        this.graphs = GraphData.map(e => new Graph(e));
    }
}




