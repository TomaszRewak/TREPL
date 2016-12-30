import * as Lang from '../language'

export class AliasDeclaration extends Lang.Logic.LogicElement implements Lang.Flow.IDeclaration {
	constructor(
		public name: string,
		public log_type: Lang.Logic.LogicElement
	) { super(); }

	expectsType: Lang.TypeSystem.StaticResult;
	_compile(environment: Lang.Compiler.TypeEnvironment) {
		this.errorIfEmpty(this.log_type);
		this.cs = this.log_type.compile(environment) && this.cs;
		if (!this.cs) false;

		var varType = this.log_type.returns.varType;
		this.errorIfNot(varType instanceof Lang.TypeSystem.PrototypeType, 'Expected type definition', this.log_type);
		if (!this.cs) return false;

		var declarationClass = <Lang.TypeSystem.PrototypeType>varType;
		environment.addElement(this.name, declarationClass);
		this.expectsType = new Lang.TypeSystem.LValue(declarationClass.declaresType());

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.createTempValue(environment);
		yield* this.instantiate(environment);
		yield Lang.Flow.Operation.memory(this);
		return;
	}

	*createTempValue(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		throw 'Alias has to be assigned to some value and has none default value';
	}

	*instantiate(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		environment.addOnStack(new Lang.TypeSystem.Alias(environment.popFromTempStack()), this.name);

		return;
	}
}