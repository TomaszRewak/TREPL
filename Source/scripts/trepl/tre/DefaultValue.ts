import * as Lang from '../language'

export class DefaultValue extends Lang.Logic.LogicElement {
	constructor(
		public log_type: Lang.Logic.LogicElement
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_type);
		this.cs = this.log_type.compile(environment) && this.cs;
		if (!this.cs) return false;

		this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
		if (!this.cs) return false;

		var elemesType = <Lang.TypeSystem.PrototypeType>this.log_type.returns.varType;

		this.returns = new Lang.TypeSystem.RValue(elemesType.declaresType());

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_type.run(environment);

		var elemType = <Lang.TypeSystem.PrototypeObj>environment.popFromTempStack().getValue();

		var object = elemType.defaultValue();
		yield* object.construct(environment);

		environment.addOnTempStack(object);

		return;
	}
}