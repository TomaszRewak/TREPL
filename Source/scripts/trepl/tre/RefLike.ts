import * as Lang from '../language'

export class RefLike extends Lang.Logic.LogicElement {
	constructor(
		public log_value: Lang.Logic.LogicElement
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_value);
		this.cs = this.log_value.compile(environment) && this.cs;
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

		var value = <Lang.TypeSystem.InstanceObj>environment.popFromTempStack().getValue();

		var field = environment.addToHeap(value.getCopy());

		environment.addOnTempStack(new Lang.TypeSystem.ReferenceObj(field));

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}