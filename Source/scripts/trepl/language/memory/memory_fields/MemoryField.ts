import { Stack } from '../data_structures/Stack'
import { MemoryFieldObserver } from '../../observers/MemoryFieldObserver'
import { Obj } from '../type_system/Base'
import { ReferenceObj } from '../type_system/Reference'

export class MemoryField {
	protected value: Obj;
	private references: Stack<ReferenceObj> = Stack.empty();

	observer: MemoryFieldObserver;

	constructor() { }

	setValue(val: Obj): MemoryField {
		this.value = val;
		this.observer.setFieldValue(val);
		return this;
	}

	getValue(): Obj {
		return this.value;
	}

	referencedBy(ref: ReferenceObj) {
		this.references = Stack.push(ref, this.references);
	}

	unreferencedBy(ref: ReferenceObj) {
		this.references = Stack.remove(ref, this.references);
	}

	getReferences(): Stack<ReferenceObj> {
		return this.references;
	}
}