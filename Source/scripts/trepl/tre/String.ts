import * as Lang from '../language'

export class String extends Lang.Logic.LogicElement {
	constructor() { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.returns = new Lang.TypeSystem.RValue(Lang.TypeSystem.StringClassObj.typeInstance);

		return true;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		environment.addOnTempStack(Lang.TypeSystem.StringClassObj.classInstance);

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}