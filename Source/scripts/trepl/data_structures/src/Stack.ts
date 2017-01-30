import { IStack } from '../IDataStructures'

class StackNode<V> {
	value: V;
	tail: StackNode<V> = null;

	constructor(value: V, tail: StackNode<V>) {
		this.value = value;
		this.tail = tail;
	}

	static map<X, Y>(node: StackNode<X>, fun: (X) => Y): StackNode<Y> {
		if (!node)
			return null;
		else
			return new StackNode<Y>(fun(node.value), this.map(node.tail, fun));
	}

	static iterate<X>(node: StackNode<X>, fun: (X) => void): void {
		if (node) {
			fun(node.value);
			this.iterate(node, fun);
		}
	}

	static iterateBack<X>(node: StackNode<X>, fun: (X) => void): void {
		if (node) {
			this.iterate(node, fun);
			fun(node.value);
		}
	}
}

export class Stack<V> implements IStack<V> {
	private _stackTop: StackNode<V> = null;
	private _size = 0;

	add(value: V): void {
		this._stackTop = new StackNode(value, this._stackTop);
		this._size++;
	}

	pop(): V {
		let top = this.top();
		this._stackTop = this._stackTop.tail;
		this._size--;
		return top;
	}

	top(): V {
		return this._stackTop.value;
	}

	size(): number {
		return this._size;
	}

	attach(from: Stack<V>): void {
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

	map<X>(fun: (value: V) => X): IStack<X> {
		let newStack = new Stack<X>();
		newStack._stackTop = StackNode.map(this._stackTop, fun);
		newStack._size = this._size;

		return newStack;
	}

	iterate(fun: (value: V) => void): void {
		StackNode.iterate(this._stackTop, fun);
	}

	iterateBack(fun: (value: V) => void): void {
		StackNode.iterateBack(this._stackTop, fun);
	}
}