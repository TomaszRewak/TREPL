import * as Lang from '../language'

export class RawData extends Lang.Logic.LogicElement {
	constructor(
		public rawData: any
	) { super(); }

	observer: Lang.Observers.RawDataElementObserver;

	_compile(environment: Lang.Compiler.TypeEnvironment) {
		var value: string = this.rawData;
		var numberValue: number = parseInt(this.rawData);

		if (!isNaN(numberValue)) {
			this.observer.isNumber(true);
			this.returns = new Lang.TypeSystem.RValue(new Lang.TypeSystem.ClassInstanceType(Lang.TypeSystem.IntClassObj.typeInstance));
		}
		else {
			this.observer.isNumber(false);
			var typeField = environment.getElement(value);

			this.errorIf(!typeField, 'No field of that name was found in this scope');
			if (!this.cs) return false;

			this.returns = new Lang.TypeSystem.LValue(typeField.typ);
		}

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		var rawData = <string>this.rawData;
		var value: number = parseInt(this.rawData);

		if (!isNaN(value)) {
			environment.addOnTempStack(Lang.TypeSystem.IntClassObj.classInstance.getObjectOfValue(value));
		}
		else {
			var stackField = environment.getFromStack(rawData);
			environment.addOnTempStack(new Lang.TypeSystem.Alias(stackField));
		}

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}