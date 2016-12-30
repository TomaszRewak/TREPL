import * as Lang from '../language'

export class TypeOf extends Lang.Logic.LogicElement {
	constructor(
		public log_type: Lang.Logic.LogicElement
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_type);
		this.cs = this.log_type.compile(environment) && this.cs;
		if (!this.cs) return false;

		this.errorIfNotInstance(this.log_type.returnsType(), this.log_type);
		if (!this.cs) return false;

		var prototype = (<Lang.TypeSystem.InstanceType>this.log_type.returns.varType).prototypeType;

		this.returns = new Lang.TypeSystem.RValue(prototype);

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_type.run(environment);

		var prototype = (<Lang.TypeSystem.InstanceObj>environment.popFromTempStack().getValue()).prototype;

		environment.addOnTempStack(prototype);

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}