export interface ISet<V> {
	add(value: V): void;
	remove(value: V): void;
}

export interface IStack<V> {
	add(value: V): void;
	pop(): V;
	top(): V;
	size(): number;

	map<X>(fun: (value: V) => X): IStack<X>;
	iterate(fun: (value: V) => void): void;
	iterateBack(fun: (value: V) => void): void;
}

export interface IScopedStack<V> {
	add(value: V): void;
	top(): V;
	pop(): V;

	addScope(): void;
	popScope(): IStack<V>;
	topScope(): IStack<V>;
	hasScope(): boolean;
	passScope(): void;
}

export interface IStackDictionary<V> {
	add(name: string, value: V): void;
	pop(name: string): V;
	top(name: string): V;
	size(name: string): number;
	has(name: string): boolean;
}

export interface IScopedStackDictionary<V> {
	add(name: string, value: V): void;
	get(name: string): V;
	has(name: string): boolean;

	addScope(): void;
	popScope(): IStack<V>;
	hasScope(): boolean;
}