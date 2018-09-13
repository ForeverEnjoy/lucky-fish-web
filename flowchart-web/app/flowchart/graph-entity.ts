export enum VertexType {
    Normal = 1,
    Dummy = 2
}

export type VertexIdType = string;

export class Vertex {
    public id: VertexIdType;
    public type: VertexType;
    public text: string;
}

export enum EdgeType {
    Normal = -1,
    Type0 = 0,
    Type1 = 1,
    Type2 = 2,
}

export class Edge {
    public from: string;
    public to: string;
    public text: string;
    public type: EdgeType;
    public isReversed: boolean;

    constructor(from: string, to: string) {
        this.from = from;
        this.to = to;
        this.text = null;
        this.type = EdgeType.Normal;
        this.isReversed = false;
    }

    public equals(other: Edge): boolean {
        return this.from === other.from
            && this.to === other.to
            && this.text === other.text;
    }

    public reverse() {
        let from = this.from; //swap arrow
        this.from= this.to;
        this.to = from;
        this.isReversed = !this.isReversed;
    }
}