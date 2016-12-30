import * as Lang from '../language'

export class ReferenceOf extends Lang.Logic.LogicElement {
	constructor(
		public log_value: Lang.Logic.LogicElement
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_value);
		this.cs = this.log_value.compile(environment) && this.cs;
		if (!this.cs) return false;

		this.errorIfNot(this.log_value.returns instanceof Lang.TypeSystem.LValue, 'Expected l-value', this.log_value);
		if (!this.cs) return false;

		var valueType = this.log_value.returns.varType;
		this.errorIfNot(valueType instanceof Lang.TypeSystem.InstanceType, 'Expected type instance', this.log_value);
		if (!this.cs) return false;

		var instanceType = <Lang.TypeSystem.InstanceType>valueType;
		this.returns = new Lang.TypeSystem.LValue(new Lang.TypeSystem.ReferenceType(new Lang.TypeSystem.ReferenceClassType(instanceType.prototypeType)));

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {

		yield* this.log_value.run(environment);

		var field = environment.popFromTempStack();
		var value = <Lang.TypeSystem.InstanceObj>field.getValue();

		environment.addOnTempStack(new Lang.TypeSystem.ReferenceObj(field));

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
} 