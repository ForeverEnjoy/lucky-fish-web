import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FlowchartsComponent } from './flowchart/flowcharts.component';

const routes: Routes = [
    { path: '', redirectTo: 'flowcharts', pathMatch: 'full' },
    { path: 'flowcharts', component: FlowchartsComponent },
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