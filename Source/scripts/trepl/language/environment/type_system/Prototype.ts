import { Object, Type } from './Base'

export class Prototype extends Object {
	observer = new TSO.PrototypeObserver(this);
	constructor(
		public functions: { [name: string]: FunctionObject }
	) {
		super();
	}
	public getCopy(): Prototype {
		return new Prototype(this.functions);
	}
	defaultValue(): Instance {
		return new Instance(this);
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