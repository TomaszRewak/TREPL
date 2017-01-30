import * as DataStructures from '../data_structures'
export { DataStructures }

export interface IMemoryField<V> {
    set(value: V): void;
    get(): V;
}

export interface IMemoryEnvironmentStack<V, M extends IMemoryField<V>> {
    add(value: V): M;
    top(): M;
    pop(): M;

    addScope(): void;
    popScope(): DataStructures.IStack<M>;

    passScope(): void;
    scopeSize(): number;
}

export interface IMemoryEnvironmentNamedStack<V, M extends IMemoryField<V>> {
    add(name: string, value: V): M;
    has(name: string): boolean;
    get(name: string): M;

    addScope(): void;
    popScope(): DataStructures.IStack<M>;
}

export interface IMemoryEnvironmentHeap<V, M extends IMemoryField<V>> {
    add(value: V): M;
    remove(field: M);
}

export interface IMemoryEnvironment<V, M extends IMemoryField<V>> {
    stack(): IMemoryEnvironmentStack<V, M>;
    namedStack(): IMemoryEnvironmentNamedStack<V, M>;
    heap(): IMemoryEnvironmentHeap<V, M>;
}