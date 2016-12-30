import * as Lang from '../language'

export class ElementAt extends Lang.Logic.LogicElement {
	constructor(
		public log_array: Lang.Logic.LogicElement,
		public log_index: Lang.Logic.LogicElement
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_array);
		this.errorIfEmpty(this.log_index);
		this.cs = this.log_array.compile(environment) && this.cs;
		this.cs = this.log_index.compile(environment) && this.cs;

		if (!this.cs) return false;

		this.errorIfNotInstance(this.log_index.returnsType(), this.log_index);
		if (!this.cs) return false;

		var leftType = this.log_array.returnsType();
		while (leftType instanceof Lang.TypeSystem.ReferenceType)
			leftType = (<Lang.TypeSystem.ReferenceType>leftType).prototypeType.referencedPrototypeType.declaresType();

		var arrayInstance = <Lang.TypeSystem.InstanceType>leftType;
		var indexInstance = <Lang.TypeSystem.InstanceType>this.log_index.returnsType();

		this.errorIfNot(arrayInstance instanceof Lang.TypeSystem.ArrayType, 'Expected array', this.log_array);
		if (!this.cs) return false;

		var arrayType = (<Lang.TypeSystem.ArrayType>arrayInstance).prototypeType;

		this.returns = new Lang.TypeSystem.LValue(arrayType.elementsClass.declaresType());

		return true;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_index.run(environment);
		yield* this.log_array.run(environment);

		var tempMemoryField = environment.popFromTempStack();
		var index: number = (<Lang.TypeSystem.BaseClassInstanceObj>environment.popFromTempStack().getValue()).rawValue;

		while (tempMemoryField.getValue() instanceof Lang.TypeSystem.ReferenceObj)
			tempMemoryField = (<Lang.TypeSystem.ReferenceObj>tempMemoryField.getValue()).reference;
		var leftObject = tempMemoryField.getValue();

		var object = <Lang.TypeSystem.ArrayObj>leftObject;

		var arrayField = object.getField(index);
		environment.addOnTempStack(new Lang.TypeSystem.Alias(arrayField));

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}
