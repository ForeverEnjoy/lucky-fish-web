import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptionsArgs, Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';

@Injectable()
export class ScytherHttp {

    constructor(
        private http: Http,
    ) { }

    private addContentTypeHeader(options?: RequestOptionsArgs): RequestOptionsArgs {
        if (!options) {
            let headers = new Headers();
            options = { headers: headers };
        }

        options.headers.append('Content-Type', 'application/json; charset=utf-8');
        return options;
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.http.get(url);
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.http.post(url, body, this.addContentTypeHeader(options));
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.http.put(url, body, this.addContentTypeHeader(options));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.http.delete(url);
    }

    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.http.patch(url, body, this.addContentTypeHeader(options));
    }

    head(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.http.head(url);
    }

    options(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.http.options(url);
    }
}
