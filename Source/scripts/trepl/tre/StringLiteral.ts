import * as Lang from '../language'

export class StringLiteral extends Lang.Logic.LogicElement {
	constructor(
		public rawData: any
	) { super(); }

	observer: E.RawData;

	_compile(environment: Lang.Compiler.TypeEnvironment) {
		var value: string = this.rawData;

		this.observer.isNumber(true);
		this.returns = new Lang.TypeSystem.RValue(new Lang.TypeSystem.ClassInstanceType(Lang.TypeSystem.StringClassObj.typeInstance));

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		var rawData = <string>this.rawData;

		environment.addOnTempStack(Lang.TypeSystem.StringClassObj.classInstance.getObjectOfValue(rawData));

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}