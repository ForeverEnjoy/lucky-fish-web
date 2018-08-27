import { Component } from '@angular/core';

@Component({
    selector: 'my-app',
    template: `
        <div class="percent-100-wh">
            <div class="percent-100-w">
                <homepage-top-bar>
                </homepage-top-bar>
            </div>
            <div class="percent-100-w">
                <router-outlet></router-outlet>
            </div>
        </div>
    `
})

export class AppComponent {
    name = 'Angular';
}
