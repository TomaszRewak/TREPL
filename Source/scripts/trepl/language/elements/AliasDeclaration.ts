import * as Flow from '../flow'
import * as Logic from '../logic'
import * as TypeSystem from '../type_system'
import * as Compiler from '../compiler'
import * as Environment from '../environment'

export class AliasDeclaration extends Logic.LogicElement implements Flow.IDeclaration {
	constructor(
		public name: string,
		public log_type: Logic.LogicElement
	) { super(); }

	expectsType: TypeSystem.StaticResult;
	_compile(environment: Compiler.TypeEnvironment) {
		this.errorIfEmpty(this.log_type);
		this.cs = this.log_type.compile(environment) && this.cs;
		if (!this.cs) false;

		var varType = this.log_type.returns.varType;
		this.errorIfNot(varType instanceof TypeSystem.PrototypeType, 'Expected type definition', this.log_type);
		if (!this.cs) return false;

		var declarationClass = <TypeSystem.PrototypeType>varType;
		environment.addElement(this.name, declarationClass);
		this.expectsType = new TypeSystem.LValue(declarationClass.declaresType());

		return this.cs;
	}

	*execute(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		yield* this.createTempValue(environment);
		yield* this.instantiate(environment);
		yield Flow.Operation.memory(this);
		return;
	}

	*createTempValue(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		throw 'Alias has to be assigned to some value and has none default value';
	}

	*instantiate(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		environment.addValueToStack(new TypeSystem.Alias(environment.popTempValue()), this.name);

		return;
	}
}