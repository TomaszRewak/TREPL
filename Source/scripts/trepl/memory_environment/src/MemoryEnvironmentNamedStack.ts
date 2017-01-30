import { DataStructures as DS, IMemoryEnvironmentNamedStack, IMemoryField } from '../IMemoryEnvironment'

export abstract class MemoryEnvironmentNamedStack<V, M extends IMemoryField<V>> implements IMemoryEnvironmentNamedStack<V, M> {
    private stack: DS.IScopedStackDictionary<M> = new DS.ScopedStackDictionary<M>();

    add(name: string, value: V): M {
        let field = this.allocate(name);
        field.set(value);
        this.stack.add(name, field);
        return field;
    }
    has(name: string): boolean {
        return this.stack.has(name);
    }
    get(name: string): M {
        return this.stack.get(name);
    }

    addScope(): void {
        this.addScope();
    }
    popScope(): DS.IStack<M> {
        return this.popScope();
    }

    protected abstract allocate(name: string): M;
}