import { Component, OnInit } from '@angular/core';


@Component ({
    selector: 'homepage-top-bar'    ,
    template: `
        <div class="comp-wrapper
                    comp-wrapper-aligner
                    percent-100-w
                    comp-wrapper-h
                    vh-center-aligner
                    white-bg">
            <div class="content-wh
                        max-w-0
                        content-aligner
                        v-center-aligner">
                <div class="m-r-auto-aligner
                            flex-row-aligner"> 
                    <div class="logo-wrapper-wh">
                        <img src="/app/resource/scyther-cute.png"
                             class="percent-100-wh"> 
                    </div>
                    <div class="v-center-aligner">
                        <div class="font-type-1">
                            SCYTHER
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: [
        'app/top-bar/top-bar.aligner.css',
        'app/top-bar/top-bar.sizer.css',
        'app/top-bar/top-bar.css'
    ]
})

export class TorBarComponent {
}