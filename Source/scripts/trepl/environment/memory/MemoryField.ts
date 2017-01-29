import { Stack } from '../../data_structures'
import { IMemoryField, IValue, IReference } from '../interfaces'
import { Observable } from '../../observer'

export class MemoryField implements IMemoryField {
	protected value: IValue;
	private references: Stack<IReference> = Stack.empty();

	observer = new Observable(this);

	constructor() { }

	setValue(val: IValue): IMemoryField {
		this.value = val;
		this.observer.emit('set field value', val);
		return this;
	}

	getValue(): IValue {
		return this.value;
	}

	referencedBy(ref: IReference) {
		this.references = Stack.push(ref, this.references);
	}

	unreferencedBy(ref: IReference) {
		this.references = Stack.remove(ref, this.references);
	}

	getReferences(): Stack<IReference> {
		return this.references;
	}
}