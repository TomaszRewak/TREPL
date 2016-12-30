import * as Lang from '../language'

export class Path extends Lang.Logic.LogicElement {
	constructor(
		public log_left: Lang.Logic.LogicElement,
		public name: string
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment) {
		this.errorIfEmpty(this.log_left);
		this.cs = this.log_left.compile(environment) && this.cs;
		if (!this.cs) return false;

		this.errorIfNotInstance(this.log_left.returns.varType, this.log_left);
		if (!this.cs) return false;

		var leftType = <Lang.TypeSystem.InstanceType>this.log_left.returns.varType;

		this.innerContext = leftType;

		var leftPrototype = leftType.prototypeType;

		if (leftPrototype instanceof Lang.TypeSystem.ClassType) {
			this.errorIfNot(leftPrototype.hasField(this.name) || leftPrototype.hasMethod(this.name), 'None field nor method of this name was found');
			if (!this.cs) return false;

			if (leftPrototype.hasField(this.name))
				this.returns = new Lang.TypeSystem.LValue(leftPrototype.fields[this.name].typ);
			else
				this.returns = new Lang.TypeSystem.RValue(leftPrototype.functions[this.name].declaresType());
		}
		else {
			this.errorIfNot(leftPrototype.hasMethod(this.name), 'None method for this name was found');
			if (!this.cs) return false;
			this.returns = new Lang.TypeSystem.RValue(leftPrototype.functions[this.name].declaresType());
		}

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_left.run(environment);

		var isAlias = environment.isTempValueAlias();
		var thisMemoryField = environment.popFromTempStack();
		var valueLeft = <Lang.TypeSystem.InstanceObj>thisMemoryField.getValue();

		if (valueLeft instanceof Lang.TypeSystem.ClassInstanceObj) {
			if (valueLeft.hasFieldValue(this.name)) {
				var customTypeField = valueLeft.getFieldValue(this.name);
				environment.addOnTempStack(new Lang.TypeSystem.Alias(customTypeField));
			}
			else if (valueLeft.hasMethod(this.name)) {
				var method = valueLeft.getMethod(thisMemoryField, this.name, isAlias);
				environment.addOnTempStack(method);
			}
			else {
				throw 'No such field or method was found for this object';
			}
		}
		else {
			if (valueLeft.hasMethod(this.name)) {
				var method = valueLeft.getMethod(thisMemoryField, this.name, isAlias);
				environment.addOnTempStack(method);
			}
			else {
				throw 'No such field or method was found for this object';
			}
		}

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}