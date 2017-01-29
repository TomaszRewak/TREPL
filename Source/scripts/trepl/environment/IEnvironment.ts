import * as DataStructures from '../data_structures'
export { DataStructures }

export interface IValue {
}

export interface IMemoryField<Val extends IValue> {
    set(val: Val): IMemoryField<Val>;
    get(): Val;
}

export interface IEnvironmentNamedStack<Val extends IValue> {
    add(name: string, value: Val): IMemoryField<Val>;
    has(name: string): boolean;
    get(name: string): IMemoryField<Val>;

    addScope(): void;
    popScope(): DataStructures.Stack<IMemoryField<Val>>;
}

export interface IEnvironmentHeap<Val extends IValue> {
    add(value: Val): IMemoryField<Val>;
    remove(field: IMemoryField<Val>);
}

export interface IEnvironmentStack<Val extends IValue> {
    add(value: Val): IMemoryField<Val>;
    top(): IMemoryField<Val>;
    pop(): IMemoryField<Val>;

    addScope(): void;
    popScope(): DataStructures.Stack<IMemoryField<Val>>;

    passScope(): void;
    scopeSize(): number;
}