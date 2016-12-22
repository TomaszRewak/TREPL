import { ObjectObserver } from '../../observers/ObjectObserver'

export class Obj {
	observer: ObjectObserver;
	public getCopy(): Obj { return new Obj(); }
}

export class Type {
	getTypeName(): string {
		return "";
	}
	assignalbeTo(second: Type): boolean {
		return false;
	}
}