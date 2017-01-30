import { DataStructures as DS, IMemoryEnvironment, IMemoryField, IMemoryEnvironmentStack, IMemoryEnvironmentNamedStack, IMemoryEnvironmentHeap } from '../IMemoryEnvironment'

export class MemoryEnvironment<V, M extends IMemoryField<V>> implements IMemoryEnvironment<V, M>
{
    private _stack: IMemoryEnvironmentStack<V, M>;
    private _namedStack: IMemoryEnvironmentNamedStack<V, M>;
    private _heap: IMemoryEnvironmentHeap<V, M>;

    constructor(stack: IMemoryEnvironmentStack<V, M>, namedStack: IMemoryEnvironmentNamedStack<V, M>, heap: IMemoryEnvironmentHeap<V, M>) {
        this._stack = stack;
        this._namedStack = namedStack;
        this._heap = heap;
    }

    stack(): IMemoryEnvironmentStack<V, M> {
        return this._stack;
    }
    namedStack(): IMemoryEnvironmentNamedStack<V, M> {
        return this._namedStack;
    }
    heap(): IMemoryEnvironmentHeap<V, M> {
        return this._heap;
    }
}