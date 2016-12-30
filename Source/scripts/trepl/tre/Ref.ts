import * as Lang from '../language'

export class Ref extends Lang.Logic.LogicElement {
	constructor(
		public log_type: Lang.Logic.LogicElement
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {

		this.cs = this.log_type.compile(environment) && this.cs;
		if (!this.cs) return false;

		this.errorIfEmpty(this.log_type);
		if (!this.cs) return false;

		this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
		if (!this.cs) return false;

		var prototypeType = <Lang.TypeSystem.PrototypeType>this.log_type.returnsType();

		this.returns = new Lang.TypeSystem.RValue(new Lang.TypeSystem.ReferenceClassType(prototypeType));

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {

		environment.addOnTempStack(new Lang.TypeSystem.ReferenceClassObj());

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}