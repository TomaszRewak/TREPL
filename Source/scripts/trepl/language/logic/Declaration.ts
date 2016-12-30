import * as Flow from '../flow'
import * as Memory from '../memory'
import * as TypeSystem from '../type_system'
import * as Environment from '../environment'

export class EnclosedValue implements Flow.IDeclaration {
	constructor(public name: string, private value: Memory.Value) {
		this.value = value.getCopy();
	}

	expectsType: TypeSystem.StaticResult = null;

	*createTempValue(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		environment.pushTempValue(this.value.getCopy());

		yield Flow.Operation.memory(this);
		return;
	}

	*instantiate(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		environment.addValueToStack(environment.popTempValue().getValue(), this.name);
		return;
	}

	*execute(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		yield* this.createTempValue(environment);
		yield* this.instantiate(environment);
		yield Flow.Operation.memory(this);
		return;
	}
}

export class ImplicitDeclaration implements Flow.IDeclaration {
	constructor(public name: string, public expectsType: TypeSystem.StaticResult, private prototype: TypeSystem.PrototypeObj) {
	}

	*createTempValue(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		if (this.expectsType instanceof TypeSystem.RValue)
			environment.pushTempValue(this.prototype.defaultValue());
		else
			throw 'Cannot declare alias. Alias field has to be defined as well.';

		return;
	}

	*instantiate(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		if (this.expectsType instanceof TypeSystem.RValue)
			environment.addValueToStack(environment.popTempValue().getValue().getCopy(), this.name);
		else
			environment.addValueToStack(new TypeSystem.Alias(environment.popTempValue()), this.name);

		return;
	}

	*execute(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		yield* this.createTempValue(environment);
		yield* this.instantiate(environment);
		yield Flow.Operation.memory(this);
		return;
	}
}