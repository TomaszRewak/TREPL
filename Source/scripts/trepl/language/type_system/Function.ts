import { StaticResult } from './StaticResult'
import { Instance, InstanceType } from './Instance'
import { Prototype, PrototypeType } from './Prototype'
import { Operation, IDeclaration } from '../flow'
import { IEnvironment } from '../../environment'

export class Function<Env extends IEnvironment> extends Instance {
	*call(environment: Env, passedArguments: number): IterableIterator<Operation> {
		environment.addScope('Function Call');

		for (var i = 0; i < this.closure.length; i++) {
			var enclosedValue = this.closure[i];
			yield* enclosedValue.execute(environment);
		}

		for (var i = 0; i < this.parameters.length; i++) {
			yield* this.parameters[i].instantiate(environment);
		}

		yield* this.behaviour(environment);

		environment.removeScope();

		return;
	}
	constructor(
		public prototype: FunctionClass,
		public parameters: IDeclaration<Env>[],
		public behaviour: (environment: Env) => IterableIterator<Operation>,
		public closure: IDeclaration<Env>[] = [])
	{ super(prototype); }
	public getCopy(): Function<Env> {
		return new Function<Env>(this.prototype, this.parameters, this.behaviour, this.closure);
	}
}

export class FunctionClass extends Prototype {
	constructor() {
		super({});
	}
}

export class FunctionParapeterType {
	constructor(
		public name: string,
		public paramType: StaticResult,
		public hasDefaultValue: boolean)
	{ }
}

export class FunctionType extends InstanceType {
	constructor(
		public prototypeType: FunctionClassType
	) { super(prototypeType); }
}

export class FunctionClassType extends PrototypeType {
	constructor(
		public parameters: FunctionParapeterType[],
		public returnType: StaticResult
	) {
		super('(' + parameters.map(e => e.paramType.varType.getTypeName()).join(', ') + ') => ' + returnType.varType.getTypeName(), {});
	}
	declaresType(): FunctionType {
		return new FunctionType(this);
	}
}