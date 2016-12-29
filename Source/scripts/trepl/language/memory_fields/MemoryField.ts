import * as DataStructures from '../data_structures'
import * as Observers from '../observers'

export interface Value {
	getCopy(): Value;
	dereference(): MemoryField;
}

export interface Reference {
}

export class MemoryField {
	protected value: Value;
	private references: DataStructures.Stack<Reference> = DataStructures.Stack.empty();

	observer: Observers.MemoryFieldObserver;

	constructor() { }

	setValue(val: Value): MemoryField {
		this.value = val;
		this.observer.setFieldValue(val);
		return this;
	}

	getValue(): Value {
		return this.value;
	}

	referencedBy(ref: Reference) {
		this.references = DataStructures.Stack.push(ref, this.references);
	}

	unreferencedBy(ref: Reference) {
		this.references = DataStructures.Stack.remove(ref, this.references);
	}

	getReferences(): DataStructures.Stack<Reference> {
		return this.references;
	}
}