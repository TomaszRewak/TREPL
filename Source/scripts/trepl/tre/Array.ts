import * as Lang from '../language'

export class Array extends Lang.Logic.LogicElement {
	constructor(
		public log_type: Lang.Logic.LogicElement,
		public log_length: string
	) { super(); }

	length: number;
	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_type);
		if (!this.cs) return false;

		this.cs = this.log_type.compile(environment) && this.cs;
		if (!this.cs) return false;

		this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
		if (!this.cs) return false;

		this.length = parseInt(this.log_length);
		this.errorIf(isNaN(this.length), 'provided length is not a number');
		if (!this.cs) return false;
		this.errorIf(this.length <= 0, 'length must be greater then zero');
		if (!this.cs) return false;

		var prototypeType = <Lang.TypeSystem.PrototypeType>this.log_type.returnsType();
		this.returns = new Lang.TypeSystem.RValue(new Lang.TypeSystem.ArrayOfLengthClassType(prototypeType, this.length));

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_type.run(environment);

		var tempValue = <Lang.TypeSystem.PrototypeObj>environment.popFromTempStack().getValue();
		environment.addOnTempStack(new Lang.TypeSystem.ArrayClassObj(tempValue, this.length));

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}
