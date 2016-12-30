import * as Lang from '../language'
import { AliasDeclaration } from './AliasDeclaration'

export class AliasDefinition extends AliasDeclaration {
	constructor(
		name: string,
		log_type: Lang.Logic.LogicElement,
		private log_value: Lang.Logic.LogicElement
	) {
		super(
			name,
			log_type
		);
	}

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_type);
		this.cs = this.log_type.compile(environment) && this.cs;
		this.errorIfEmpty(this.log_value);
		this.cs = this.log_value.compile(environment) && this.cs;
		if (!this.cs) return false;

		var typeType = this.log_type.returns.varType;
		this.errorIfNot(typeType instanceof Lang.TypeSystem.PrototypeType, 'Expected type definition', this.log_type);
		if (!this.cs) return false;

		var valType = this.log_value.returns.varType;
		this.errorIfNot(valType instanceof Lang.TypeSystem.InstanceType, 'Expected object instance', this.log_value);
		if (!this.cs) return false;

		var declarationClass = <Lang.TypeSystem.PrototypeType>typeType;
		environment.addElement(this.name, declarationClass.declaresType());
		var prototypeType = <Lang.TypeSystem.PrototypeType>typeType;
		this.expectsType = new Lang.TypeSystem.LValue(declarationClass.declaresType());

		this.errorIfTypeMismatch(this.expectsType, this.log_value.returns, this.log_value);
		if (!this.cs) return false;

		return this.cs;
	}

	*createTempValue(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_value.run(environment);
		return;
	}
}