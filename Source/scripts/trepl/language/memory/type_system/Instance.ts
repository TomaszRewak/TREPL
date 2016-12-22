import { Obj, Type } from './Base'
import { Prototype, PrototypeType } from './Prototype'
import { MemoryField } from '../memory_fields/MemoryField'

export class InstanceObj extends Obj {
	constructor(public prototype: Prototype) {
		super();
	}
	public hasMethod(name: string): boolean {
		return this.prototype.functions[name] != null;
	}
	public getMethod(thisField: MemoryField, name: string, alaisedThis: boolean): FunctionObject {
		return new Method(thisField, this.prototype.functions[name], alaisedThis);
	}
	public getCopy(): Obj { return this.prototype.defaultValue(); }
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