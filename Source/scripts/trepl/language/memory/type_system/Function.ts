import { StaticResult } from './StaticResult'
import { InstanceObj, InstanceType } from './Instance'
import { PrototypeObj, PrototypeType } from './Prototype'

export class FunctionParapeterType {
	constructor(
		public name: string,
		public paramType: StaticResult,
		public hasDefaultValue: boolean)
	{ }
}

export class FunctionClassObj extends PrototypeObj {
	constructor() {
		super({});
	}
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

export class FunctionObj extends InstanceObj {
	observer = new TSO.FunctionObserver(this);
	*call(environment: Memory.Environment, passedArguments: number): IterableIterator<L.Operation> {
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
		public prototype: FunctionClassObj,
		public parameters: L.IDeclaration[],
		public behaviour: (environment: Memory.Environment) => IterableIterator<L.Operation>,
		public closure: L.IDeclaration[] = [])
	{ super(prototype); }
	public getCopy(): FunctionObj {
		return new FunctionObj(this.prototype, this.parameters, this.behaviour, this.closure);
	}
}

export class FunctionType extends InstanceType {
	constructor(
		public prototypeType: FunctionClassType
	) { super(prototypeType); }
}