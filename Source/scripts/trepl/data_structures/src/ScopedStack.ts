import { IStack, IScopedStack } from '../IDataStructures'
import { Stack } from './Stack'

export class ScopedStack<V> implements IScopedStack<V> {
	private scopes: IStack<IStack<V>> = new Stack<Stack<V>>();

	add(value: V): void {
		this.scopes.top().add(value);
	}
	top(): V {
		return this.topScope().top();
	}
	pop(): V {
		let top = this.top();
		this.topScope().pop();
		return top;
	}

	addScope(): void {
		this.scopes.add(new Stack<V>());
	}
	popScope(): IStack<V> {
		let top = this.topScope();
		this.scopes.pop();
		return top;
	}
    topScope(): IStack<V> {
        return this.scopes.top();
    }
	hasScope(): boolean {
		return !!this.scopes.size();
	}
	passScope(): void {
		var top = this.popScope();
		top.iterateBack(v => {
			this.add(v);
		});
	}
}