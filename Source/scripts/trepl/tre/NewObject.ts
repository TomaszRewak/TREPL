import * as Lang from '../language'

export class NewObject extends Lang.Logic.LogicElement {
	constructor(
		public log_type: Lang.Logic.LogicElement,
		public log_arguments: Lang.Logic.LogicElement[]
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.error('This element is not supported yet');
		if (!this.cs) return false;

		this.log_type.compile(environment);
		for (var i = 0; i < this.log_arguments.length; i++)
			this.log_arguments[i].compile(environment);

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_type.run(environment);

		var classType = <Lang.TypeSystem.PrototypeObj>environment.popFromTempStack().getValue();

		throw "Impelement this";
		//var values: { [name: string]: TS.Object } = {};
		//for (var i = 0; i < classType.fields.length; i++) {
		//    var field = classType.fields[i];
		//    if (field.defaultValue) {
		//        yield* field.defaultValue.value.run(environment);
		//        values[field.name] = environment.popTempValue().getValue().getCopy();
		//    }
		//    else {
		//        values[field.name] = field.paramType.getDefaultValue();
		//    }
		//}
		//var object = classType.getObjectOfValue(values);
		//environment.pushTempValue(object);
	}
}