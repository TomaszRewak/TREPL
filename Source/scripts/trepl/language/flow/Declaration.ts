import { LogicElement } from './LogicElement'
import { Operation } from './Operation'
import { StaticResult, RValue } from '../memory/type_system/StaticResult'
import { Obj } from '../memory/type_system/Base'
import { PrototypeObj } from '../memory/type_system/Prototype'

export class IDeclaration extends LogicElement {
	constructor(public name: string) {
		super();
	}
	*execute(environment: Memory.Environment): IterableIterator<Operation> {
		yield* this.createTempValue(environment);
		yield* this.instantiate(environment);
		yield Operation.memory(this);
		return;
	}
	*instantiate(environment: Memory.Environment): IterableIterator<Operation> {
		throw 'abstract class member call';
	}
	*createTempValue(environment: Memory.Environment): IterableIterator<Operation> {
		throw 'abstract class member call';
	}
	expectsType: StaticResult;
}

export class EnclosedValue extends IDeclaration {
	constructor(public name: string, private value: Obj) {
		super(name);
		this.value = value.getCopy();
	}

	expectsType: StaticResult = null;

	*createTempValue(environment: Memory.Environment): IterableIterator<Operation> {
		environment.pushTempValue(this.value.getCopy());

		yield Operation.memory(this);
		return;
	}

	*instantiate(environment: Memory.Environment): IterableIterator<Operation> {
		environment.addValueToStack(environment.popTempValue().getValue(), this.name);
		return;
	}

	*execute(environment: Memory.Environment): IterableIterator<Operation> {
		yield* this.createTempValue(environment);
		yield* this.instantiate(environment);
		yield Operation.memory(this);
		return;
	}
}

export class ImplicitDeclaration extends IDeclaration {
	constructor(public name: string, public expectsType: StaticResult, private prototype: PrototypeObj) {
		super(name);
	}

	*createTempValue(environment: Memory.Environment): IterableIterator<Operation> {
		if (this.expectsType instanceof RValue) {
			environment.pushTempValue(this.prototype.defaultValue());
		}
		else {
			throw 'Cannot declare alias. Alias field has to be defined as well.';
		}
		return;
	}

	*instantiate(environment: Memory.Environment): IterableIterator<Operation> {
		if (this.expectsType instanceof RValue) {
			environment.addValueToStack(environment.popTempValue().getValue().getCopy(), this.name);
		}
		else {
			environment.addAliasToStack(environment.popTempValue(), this.name);
		}

		return;
	}

	*execute(environment: Memory.Environment): IterableIterator<Operation> {
		yield* this.createTempValue(environment);
		yield* this.instantiate(environment);
		yield Operation.memory(this);
		return;
	}
}