export enum VertexType {
    Normal = 1,
    Dummy = 2
}

export class Vertex {
    public index: number;
    public id: string;
    public type: VertexType;
    public text: string;
}

export enum EdgeType {
    Normal = 1,
    InnerSegment = 2,
}

export class Edge {
    public from: number;
    public to: number;
    public label: string;
    public type: number;
    public isReversed: boolean;

    constructor(from: number, to: number) {
        this.from = from;
        this.to = to;
        this.label = null;
        this.type = -1;
        this.isReversed = false;
    }

    public equals(other: Edge): boolean {
        return this.from === other.from
            && this.to === other.to
            && this.label === other.label;
    }

    public reverse() {
        let from = this.from; //swap arrow
        this.from= this.to;
        this.to = from;
        this.isReversed = !this.isReversed;
    }
}