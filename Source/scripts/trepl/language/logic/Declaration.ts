import * as Flow from '../flow'
import * as Memory from '../memory'
import * as TypeSystem from '../type_system'
import * as Environment from '../environment'
import { LogicElement } from './LogicElement'

export class EnclosedValue implements Flow.IDeclaration {
	constructor(public name: string, private value: Memory.Value) {
		this.value = value.getCopy();
	}

	*execute(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		yield* this.createTempValue(environment);
		yield* this.instantiate(environment);
		yield Flow.Operation.memory(this);
		return;
	}

	*createTempValue(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		environment.addOnTempStack(this.value.getCopy());
		yield Flow.Operation.memory(this);
		return;
	}

	*instantiate(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		environment.addOnStack(environment.popFromTempStack().getValue(), this.name);
		return;
	}
}

export abstract class Declaration extends LogicElement implements Flow.IDeclaration {
	constructor(public name: string) {
		super();
	}

	typeOfVariable: TypeSystem.StaticResult = null;

	*execute(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		yield* this.createTempValue(environment);
		yield* this.instantiate(environment);
		yield Flow.Operation.memory(this);
		return;
	}

	abstract instantiate(environment: Environment.Environment);
	abstract createTempValue(environment: Environment.Environment);
}

export class ImplicitDeclaration extends Declaration {
	constructor(expectsType: TypeSystem.StaticResult, private prototype: TypeSystem.PrototypeObj) {
		super(name);
		this.typeOfVariable = expectsType;
	}

	*createTempValue(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		if (this.typeOfVariable instanceof TypeSystem.RValue)
			environment.addOnTempStack(this.prototype.defaultValue());
		else
			throw 'Cannot declare alias. Alias field has to be defined as well.';

		return;
	}

	*instantiate(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		if (this.typeOfVariable instanceof TypeSystem.RValue)
			environment.addOnStack(environment.popFromTempStack().getValue().getCopy(), this.name);
		else
			environment.addOnStack(new TypeSystem.Alias(environment.popFromTempStack()), this.name);

		return;
	}
}