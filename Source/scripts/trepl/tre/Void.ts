import * as Lang from '../language'

export class Void extends Lang.Logic.LogicElement {
	constructor() { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.returns = new Lang.TypeSystem.RValue(Lang.TypeSystem.VoidClassObj.typeInstance);

		return true;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		environment.addOnTempStack(Lang.TypeSystem.VoidClassObj.classInstance);

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}