import { Object, Type } from './Base'

export class Instance extends Object {
	constructor(public prototype: Prototype) {
		super();
	}
	public hasMethod(name: string): boolean {
		return this.prototype.functions[name] != null;
	}
	public getMethod(thisField: Memory.MemoryField, name: string, alaisedThis: boolean): FunctionObject {
		return new Method(thisField, this.prototype.functions[name], alaisedThis);
	}
	public getCopy(): Object { return this.prototype.defaultValue(); }
	public *construct(environment: Memory.Environment): IterableIterator<L.Operation> {
		return;
	}
}
export class InstanceType extends Type {
	constructor(public prototypeType: PrototypeType) {
		super();
	}
	hasMethod(name: string): boolean {
		return this.prototypeType.hasMethod(name);
	}
	getTypeName(): string {
		return this.prototypeType.instanceName;
	}
}