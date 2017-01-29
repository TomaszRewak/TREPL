import { IStack, IStackDictionary } from './IDataStructures'
import { Stack } from './Stack'

export class StackDictionary<V> implements IStackDictionary<V> {
	private map: { [id: string]: IStack<V> } = {}

	add(name: string, value: V): void {
		if (!this.map[name])
			this.map[name] = new Stack<V>();

		this.map[name].add(value);
	}
    
	pop(name: string): void {
		this.map[name].pop();
	}

	top(name: string): V {
		return this.map[name].top();
	}

	size(name: string): number {
		if (this.map[name])
            return this.map[name].size();
        else
            return 0;
	}

	has(name: string): boolean {
		return this.size(name) > 0;
	}
}