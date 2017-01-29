import { IStack } from './IDataStructures'

class StackNode<T> {
	value: T;
	tail: StackNode<T> = null;

	constructor(value: T, tail: StackNode<T>) {
		this.value = value;
		this.tail = tail;
	}

	static map<X, Y>(node: StackNode<X>, fun: (X) => Y): StackNode<Y> {
		if (!node)
			return null;
		else
			return new StackNode<Y>(fun(node.value), this.map(node.tail, fun));
	}
}

export class Stack<T> implements IStack<T> {
	private _stackTop: StackNode<T> = null;
	private _size = 0;

	add(value: T): void {
		this._stackTop = new StackNode(value, this._stackTop);
		this._size++;
	}

	pop(): void {
		this._stackTop = this._stackTop.tail;
		this._size--;
	}

	top(): T {
		return this._stackTop.value;
	}

	size(): number {
		return this._size;
	}

	attach(from: Stack<T>): void {
		if (!from._stackTop)
			return;

		let last = from._stackTop;
		while (last.tail)
			last = last.tail;

		last.tail = this._stackTop;

		this._stackTop = from._stackTop;
		this._size += from._size;

		from._size = 0;
		from._stackTop = null;
	}

	map<X>(fun: (value: T) => X): IStack<X> {
		let newStack = new Stack<X>();
		newStack._stackTop = StackNode.map(this._stackTop, fun);
		newStack._size = this._size;

		return newStack;
	}
}