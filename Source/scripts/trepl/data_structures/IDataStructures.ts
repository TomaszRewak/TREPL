export interface IStack<V> {
	add(value: V): void;
	pop(): void;
	top(): V;
	size(): number;

	map<X>(fun: (value: V) => X): IStack<X>;
}

export interface IScopedStack<V> {
	add(value: V): void;

	addScope(): void;
	popScope(): void;
	topScope(): IStack<V>;
	hasScope(): boolean;
}

export interface IStackDictionary<V> {
	add(name: string, value: V): void;
	pop(name: string): void;
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