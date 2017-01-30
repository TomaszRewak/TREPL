import { DataStructures as DS, IMemoryEnvironmentHeap, IMemoryField } from '../IMemoryEnvironment'

export abstract class MemoryEnvironmentHeap<V, M extends IMemoryField<V>> implements IMemoryEnvironmentHeap<V, M> {
    add(value: V): M {
        let field = this.allocate();
        field.set(value);
        return field;
    }

    remove(field: M) {
    }

    protected abstract allocate(): M;
}