import { IMemoryField } from '../IMemoryEnvironment'

export class MemoryField<V> implements IMemoryField<V> {
	protected value: V;

	set(value: V): void {
		this.value = value;
	}

	get(): V {
		return this.value;
	}
}