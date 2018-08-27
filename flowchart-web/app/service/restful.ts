import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';

export class BaseResponse {
    constructor(
        public code: number,
        public message: string) { }

    static fromJson(jsonObject: any): BaseResponse {
        if (null == jsonObject) {
            return null;
        }

        return new BaseResponse(jsonObject.code, jsonObject.message);
    }
}

export class ErrorResponse {
    constructor(
        public httpResponse: Response,
        public baseResponse: BaseResponse) { }
}

export class QueryCollection<T> {
    constructor(
        public total: number,
        public entities: T[]
    ) { }
}

export class CreateEntityResponse<T> {
    entity: T;
    error: BaseResponse;

    constructor(
        rawJsonObject: any,
        unmarshaler: (entityJson: any) => T,
        zeroFunc?: () => T,
    ) {
        this.entity = unmarshaler(rawJsonObject.entity);
        if (null == this.entity && null != zeroFunc) {
            this.entity = zeroFunc();
        }

        this.error = BaseResponse.fromJson(rawJsonObject.error);
    }
}

export class QueryEntityResponse<T> {
    queryCollection: QueryCollection<T>;
    error: BaseResponse;

    constructor(
        rawJsonObject: any,
        unmarshaler: (entityJson: any) => T,
        zeroFunc?: () => T,
    ) {
        let rawEntities = rawJsonObject.entities;
        if (null == rawEntities) {
            rawEntities = [];
        }

        let entities = fromJsonList(rawEntities, unmarshaler, zeroFunc);
        this.queryCollection = new QueryCollection(rawJsonObject.total, entities);
        this.error = BaseResponse.fromJson(rawJsonObject.error);
    }
}

export class SingleEntityResponse<T> {
    entity: T;
    error: BaseResponse;

    constructor(
        rawJsonObject: any,
        unmarshaler: (entityJson: any) => T,
        zeroFunc?: () => T,
    ) {
        this.entity = unmarshaler(rawJsonObject.entity);
        if (null == this.entity && null != zeroFunc) {
            this.entity = zeroFunc();
        }
        this.error = BaseResponse.fromJson(rawJsonObject.error);
    }
}

export class UpdateEntityResponse<T> {
    entity: T;
    error: BaseResponse;

    constructor(
        rawJsonObject: any,
        unmarshaler: (entityJson: any) => T,
        zeroFunc?: () => T,
    ) {
        this.entity = unmarshaler(rawJsonObject.entity);
        if (null == this.entity && null != zeroFunc) {
            this.entity = zeroFunc();
        }
        this.error = BaseResponse.fromJson(rawJsonObject.error);
    }
}

export class DeleteEntityResponse<T> {
    entity: T;
    error: BaseResponse;

    constructor(
        rawJsonObject: any,
        unmarshaler: (entityJson: any) => T,
        zeroFunc?: () => T,
    ) {
        this.entity = unmarshaler(rawJsonObject.entity);
        if (null == this.entity && null != zeroFunc) {
            this.entity = zeroFunc();
        }
        this.error = BaseResponse.fromJson(rawJsonObject.error);
    }
}

export function toJsonList<T>(entities: T[], marshaler: (entity: T) => any): any[] {
    if (null == entities) {
        return [];
    }

    let out = new Array(entities.length);
    for (let i = 0; i < entities.length; i++) {
        out[i] = marshaler(entities[i]);
    }
    return out;
}

export function fromJsonList<T>(
    jsonObjects: any[],
    unmarshaler: (jsonObject: any) => T,
    zeroFunc?: () => T,
): T[] {
    if (null == jsonObjects) {
        return [];
    }

    let out = new Array(jsonObjects.length);
    for (let i = 0; i < jsonObjects.length; i++) {
        out[i] = unmarshaler(jsonObjects[i]);
        if (null == out[i] && null != zeroFunc) {
            out[i] = zeroFunc();
        }
    }
    return out;
}

export function camelizedToUnderline(value: string): string {
    let out = '';
    let s = 0;
    let e = -1;
    for (let i = 0; i < value.length; i++) {
        let c = value[i];
        if ((c >= 'A') && (c <= 'Z')) {
            e = i;
            out += value.substring(s, e).toLowerCase();
            out += '_';
            s = i;
        }
    }
    out += value.substring(s, value.length);
    return out;
}

export function handleError(obser: Observable<Response>): Observable<Response> {
    return obser.do(
        httpResponse => {
            let body = httpResponse.json();
            if (0 !== body.code) {
                let baseResponse = new BaseResponse(body.code, body.message);
                throw new ErrorResponse(httpResponse, baseResponse);
            }
        }, error => {
            let body = error.json();
            let baseResponse = new BaseResponse(body.code, body.message);
            throw new ErrorResponse(error, baseResponse);
        });
}
