import * as Base from './Base'
import * as Prototype from './Prototype'
import * as MemoryFields from '../memory_fields'
import * as Function from './Function'
import * as Method from './Method'

export class InstanceObj extends Base.Obj {
	constructor(public prototype: Prototype.PrototypeObj) {
		super();
	}
	public hasMethod(name: string): boolean {
		return this.prototype.functions[name] != null;
	}
	public getMethod(thisField: MemoryFields.MemoryField, name: string, alaisedThis: boolean): Function.FunctionObj {
		return new Method.Method(thisField, this.prototype.functions[name], alaisedThis);
	}
	public getCopy(): Base.Obj { return this.prototype.defaultValue(); }
	public *construct(environment: Memory.Environment): IterableIterator<L.Operation> {
		return;
	}
}
export class InstanceType extends Base.Type {
	constructor(public prototypeType: Prototype.PrototypeType) {
		super();
	}
	hasMethod(name: string): boolean {
		return this.prototypeType.hasMethod(name);
	}
	getTypeName(): string {
		return this.prototypeType.instanceName;
	}
}