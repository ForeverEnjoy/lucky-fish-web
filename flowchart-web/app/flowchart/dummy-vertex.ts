export class DummyVertex {
    private static readonly dummyVertexBegin = 1000;
    private static nowDummyVertex = DummyVertex.dummyVertexBegin;
    public static Create(): number {
        return DummyVertex.nowDummyVertex++;
    }

    public static isDummyVertex(vertex: number): boolean {
        return vertex >= DummyVertex.dummyVertexBegin;
    }
}