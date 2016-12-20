import { Stack } from '../data_structures/Stack'
import { MemoryFieldObserver } from '../../observers/MemoryFieldObserver'

export class MemoryField {
	protected value: TS.Obj;
	private references: Stack<TS.Reference> = Stack.empty();

	observer: MemoryFieldObserver;

	constructor() { }

	setValue(val: TS.Obj): MemoryField {
		this.value = val;
		this.observer.setFieldValue(val);
		return this;
	}

	getValue(): TS.Obj {
		return this.value;
	}

	referencedBy(ref: TS.Reference) {
		this.references = Stack.push(ref, this.references);
	}

	unreferencedBy(ref: TS.Reference) {
		this.references = Stack.remove(ref, this.references);
	}

	getReferences(): Stack<TS.Reference> {
		return this.references;
	}
}