import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { AppComponent }  from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Exports as TopBarExports } from './top-bar/export.config';
import { Exports as FlowchartExports } from './flowchart/export.config';
import { ScytherHttp } from './service/scyther-http';

@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpModule,
        FormsModule
    ],
    declarations: [
      AppComponent,
      ...TopBarExports,
      ...FlowchartExports,
    ],
    providers: [
        {
            provide: LocationStrategy,
            useClass: HashLocationStrategy
        },
        ScytherHttp
    ],
    bootstrap: [ AppComponent ]
})

export class AppModule { }
