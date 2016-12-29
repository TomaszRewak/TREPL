import * as Base from './Base'
import * as Instance from './Instance'
import * as Function from './Function'

export class PrototypeObj extends Base.Obj {
	observer = new PrototypeObserver(this);
	constructor(
		public functions: { [name: string]: Function.FunctionObj }
	) {
		super();
	}
	public getCopy(): PrototypeObj {
		return new PrototypeObj(this.functions);
	}
	defaultValue(): Instance.InstanceObj {
		return new Instance.InstanceObj(this);
	}
}
export class PrototypeType extends Base.Type {
	constructor(
		public instanceName: string,
		public functions: { [name: string]: Function.FunctionClassType }
	) {
		super();
	}
	hasMethod(name: string): boolean {
		return this.functions[name] != null;
	}
	declaresType(): Instance.InstanceType {
		return new Instance.InstanceType(this);
	}
	getTypeName(): string {
		return 'type ' + this.instanceName;
	}
}