import { DataStructures as DS, IMemoryEnvironmentStack, IMemoryField } from '../IMemoryEnvironment'

export abstract class MemoryEnvironmentStack<V, M extends IMemoryField<V>> implements IMemoryEnvironmentStack<V, M> {
    private stack: DS.IScopedStack<M> = new DS.ScopedStack<M>();

    add(value: V): M {
        let field = this.allocate();
        field.set(value);
        this.stack.add(field);
        return field;
    }
    top(): M {
        return this.stack.top();
    }
    pop(): M {
        return this.stack.pop();
    }

    addScope(): void {
        this.stack.addScope();
    }
    popScope(): DS.IStack<M> {
        return this.stack.popScope();
    }

    passScope(): void {
        this.stack.passScope();
    }
    scopeSize(): number {
        return this.stack.topScope().size();
    }

    protected abstract allocate(): M;
}