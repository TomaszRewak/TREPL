import * as Lang from '../language'

export class Bool extends Lang.Logic.LogicElement {
	constructor() { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.returns = new Lang.TypeSystem.RValue(Lang.TypeSystem.BooleanClassObj.typeInstance);

		return true;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		environment.addOnTempStack(Lang.TypeSystem.BooleanClassObj.classInstance);

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}