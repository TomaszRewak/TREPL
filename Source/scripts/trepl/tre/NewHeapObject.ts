import * as Lang from '../language'

export class NewHeapObject extends Lang.Logic.LogicElement {
	constructor(
		public log_type: Lang.Logic.LogicElement,
		public log_arguments: Lang.Logic.LogicElement[]
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_type);
		this.cs = this.log_type.compile(environment) && this.cs;

		var passedValues: Lang.Logic.LogicElement[] = [];

		for (var i = 0; i < this.log_arguments.length; i++) {
			this.cs = this.log_arguments[i].compile(environment) && this.cs;

			if (this.log_arguments[i] instanceof Lang.Logic.EmptyElement)
				continue;

			passedValues.push(this.log_arguments[i]);
		}

		this.errorIf(passedValues.length > 0, 'Argumnets for constructor are not supported yet');
		if (!this.cs) return false;

		this.errorIfNot(this.log_type.returns.varType instanceof Lang.TypeSystem.PrototypeType, 'Class definition expectad', this.log_type);
		if (!this.cs) return false;

		var classType = <Lang.TypeSystem.PrototypeType>this.log_type.returns.varType;
		this.returns = new Lang.TypeSystem.RValue(new Lang.TypeSystem.ReferenceType(new Lang.TypeSystem.ReferenceClassType(classType)));

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_type.run(environment);

		var classType = <Lang.TypeSystem.PrototypeObj>environment.popFromTempStack().getValue();
		var classObject = <Lang.TypeSystem.ClassInstanceObj>classType.defaultValue();
		yield* classObject.construct(environment);

		var onHeapElement = environment.addToHeap(classObject);
		environment.addOnTempStack(new Lang.TypeSystem.ReferenceObj(onHeapElement));

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}