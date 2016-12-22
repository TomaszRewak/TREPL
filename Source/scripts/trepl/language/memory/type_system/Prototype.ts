import { Obj, Type } from './Base'
import { InstanceObj, InstanceType } from './Instance'
import { FunctionObj, FunctionClassType } from './Function'

export class PrototypeObj extends Obj {
	observer = new PrototypeObserver(this);
	constructor(
		public functions: { [name: string]: FunctionObj }
	) {
		super();
	}
	public getCopy(): PrototypeObj {
		return new PrototypeObj(this.functions);
	}
	defaultValue(): InstanceObj {
		return new InstanceObj(this);
	}
}
export class PrototypeType extends Type {
	constructor(
		public instanceName: string,
		public functions: { [name: string]: FunctionClassType }
	) {
		super();
	}
	hasMethod(name: string): boolean {
		return this.functions[name] != null;
	}
	declaresType(): InstanceType {
		return new InstanceType(this);
	}
	getTypeName(): string {
		return 'type ' + this.instanceName;
	}
}