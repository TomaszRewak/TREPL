import { IValue } from '../../environment'
import { ITypedEnvironment, IPrototype, IPrototypeType, IInstance, IFunction } from '../environment'
import { Value, Type } from './Base'
import { Instance, InstanceType } from './Instance'
import { Function, FunctionClassType } from './Function'

export abstract class Prototype<Env extends ITypedEnvironment> extends Value implements IPrototype<Env> {
	constructor(
		public functions: { [name: string]: IFunction<Env> }
	) {
		super();
	}
	public getCopy(): IValue {
		return new Prototype(this.functions);
	}
	defaultValue(): IInstance<Env> {
		return new Instance<Env>(this);
	}
	hasMethod(name: string): boolean {
		return this.functions[name] != null;
	}
	getMethod(name: string): IFunction<Env> {
		return this.functions[name];
	}
}

export class PrototypeType extends Type implements IPrototypeType {
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