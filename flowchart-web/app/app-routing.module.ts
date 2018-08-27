import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FlowchartComponent } from './flowchart/flowchart.component';

const routes: Routes = [
    { path: '', redirectTo: 'flowchart', pathMatch: 'full' },
    { path: 'flowchart', component: FlowchartComponent },
    { path: '**', redirectTo: 'flowchart' }
];

@NgModule({
    imports: [
       RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule { }