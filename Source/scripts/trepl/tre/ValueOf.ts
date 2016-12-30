import * as Lang from '../language'

export class ValueOf extends Lang.Logic.LogicElement {
	constructor(
		public log_value: Lang.Logic.LogicElement
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_value);
		this.cs = this.log_value.compile(environment) && this.cs;
		if (!this.cs) return false;

		this.errorIfNot(this.log_value.returns.varType instanceof Lang.TypeSystem.ReferenceType, 'Expected reference', this.log_value);
		if (!this.cs) return false;

		var reference = <Lang.TypeSystem.ReferenceType>this.log_value.returns.varType;
		this.returns = new Lang.TypeSystem.LValue(reference.prototypeType.referencedPrototypeType.declaresType());

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_value.run(environment);

		var reference = <Lang.TypeSystem.ReferenceObj>environment.popFromTempStack().getValue();

		environment.addOnTempStack(new Lang.TypeSystem.Alias(reference.reference));

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}