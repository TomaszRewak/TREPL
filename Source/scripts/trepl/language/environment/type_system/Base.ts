import { ObjectObserver } from '../../observers/ObjectObserver'

export class Object {
	observer: ObjectObserver;
	public getCopy(): Object { return new Object(); }
}

export class Type {
	getTypeName(): string {
		return "";
	}
	assignalbeTo(second: Type): boolean {
		return false;
	}
}