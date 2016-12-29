import * as Observers from '../observers'
import * as MemoryFields from '../memory_fields'

export class Obj implements MemoryFields.Value {
	observer: Observers.ObjectObserver;
	public getCopy(): Obj { return new Obj(); }
	public dereference(): MemoryFields.MemoryField {
		return null;
	}
}

export class Type {
	getTypeName(): string {
		return "";
	}
	assignalbeTo(second: Type): boolean {
		return false;
	}
}