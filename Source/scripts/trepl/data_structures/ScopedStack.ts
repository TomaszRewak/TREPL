import { IStack, IScopedStack } from './IDataStructures'
import { Stack } from './Stack'

export class ScopedStack<V> implements IScopedStack<V> {
	private scopes: IStack<IStack<V>> = new Stack<Stack<V>>();

	add(value: V): void {
		this.scopes.top().add(value);
	}

	addScope(): void {
		this.scopes.add(new Stack<V>());
	}

	popScope(): void  {
		this.scopes.pop();
	}

    topScope(): IStack<V> {
        return this.scopes.top();
    }

	hasScope(): boolean {
		return !!this.scopes.size();
	}
}