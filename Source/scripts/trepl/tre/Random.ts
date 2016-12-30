import * as Lang from '../language'

export class Random extends Lang.Logic.LogicElement {
	constructor(
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment) {
		this.returns = new Lang.TypeSystem.RValue(new Lang.TypeSystem.ClassInstanceType(Lang.TypeSystem.IntClassObj.typeInstance));
		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		environment.addOnTempStack(Lang.TypeSystem.IntClassObj.classInstance.getObjectOfValue(Math.floor(Math.random() * 100)));

		return;
	}
}