import { ITypedEnvironment, Operation, IPrototype, IPrototypeType, IInstance, IInstanceType, IFunction, IValue } from '../environment'
import { Value, Type } from './Base'
import { Function } from './Function'
import { Method } from './Method'

export abstract class Instance<Env extends ITypedEnvironment> extends Value implements IInstance<Env> {
	constructor(public prototype: IPrototype<Env>) {
		super();
	}
	public hasMethod(name: string): boolean {
		return this.prototype.hasMethod(name);
	}
	public getMethod(name: string): IFunction<Env> {
		return this.prototype.getMethod(name);
	}
	public abstract getCopy(): Value;
	public abstract construct(environment: Env): IterableIterator<Operation>;
}
export class InstanceType extends Type {
	constructor(public prototypeType: IPrototypeType) {
		super();
	}
	hasMethod(name: string): boolean {
		return this.prototypeType.hasMethod(name);
	}
	getTypeName(): string {
		return this.prototypeType.instanceName;
	}
}