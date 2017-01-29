import { IStack, IScopedStack, IStackDictionary, IScopedStackDictionary } from './IDataStructures'
import { Stack } from './Stack'
import { ScopedStack } from './ScopedStack'
import { StackDictionary } from './StackDictionary'

export class StackMap<V> implements IScopedStackDictionary<V> {
	private dictionary: IStackDictionary<V> = new StackDictionary<V>();
	private scopes: IScopedStack<string> = new ScopedStack<string>();

	add(name: string, value: V): void {
		this.dictionary.add(name, value);
		this.scopes.add(name);
	}

	get(name: string): V {
		return this.dictionary.top(name);
	}

	has(name: string): boolean {
		return this.dictionary.has(name);
	}

	addScope(): void {
		this.scopes.addScope();
	}

	popScope(): IStack<V> {
		let topScope = this.scopes.topScope();
		this.scopes.popScope();

		let removed = topScope.map((v) => {
			let element = this.dictionary.top(v);
			this.dictionary.pop(v);
			return element;
		});

		return removed;
	}

	hasScope(): boolean {
		return this.scopes.hasScope();
	}
}