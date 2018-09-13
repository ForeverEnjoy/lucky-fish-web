export class DummyVertex {
    // private static readonly prefix = '_dummy_vertex_';
    private static readonly prefix = '_d_';
    private static nowDummyVertex = 1;
    public static Create(): string {
        return this.prefix + (DummyVertex.nowDummyVertex++);
    }

    public static isDummyVertex(vertexId: string): boolean {
        return vertexId.startsWith(this.prefix);
    }
}