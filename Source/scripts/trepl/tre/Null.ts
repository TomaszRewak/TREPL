import * as Lang from '../language'

export class Null extends Lang.Logic.LogicElement {
	constructor() { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.returns = new Lang.TypeSystem.RValue(new Lang.TypeSystem.ReferenceType(new Lang.TypeSystem.ReferenceClassType(Lang.TypeSystem.VoidClassObj.typeInstance)));

		return true;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		environment.addOnTempStack(new Lang.TypeSystem.ReferenceObj(null));

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}