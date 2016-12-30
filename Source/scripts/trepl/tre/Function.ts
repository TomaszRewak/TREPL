import * as Lang from '../language'

export class Function extends Lang.Logic.LogicElement {
	constructor(
		public name: string,
		public log_arguments: Lang.Logic.LogicElement[],
		public log_return: Lang.Logic.LogicElement,
		public log_list: Lang.Logic.LogicElement[]
	) { super(); }

	parameters: Lang.TypeSystem.FunctionParapeterType[];
	functionType: Lang.TypeSystem.FunctionClassType;
	declarations: Lang.Logic.Declaration[];

	closure: { [name: string]: Lang.TypeSystem.Type };
	enclosedValues: Lang.Logic.EnclosedValue[];

	private typeCompiled = false;
	compileType(environment: Lang.Compiler.TypeEnvironment): boolean {
		if (this.typeCompiled) return this.cs;
		else this.typeCompiled = true;

		this.parameters = [];
		this.declarations = [];

		this.errorIfEmpty(this.log_return);
		this.cs = this.log_return.compile(environment) && this.cs;
		if (!this.cs) return false;

		var returnType = (<Lang.TypeSystem.PrototypeType>this.log_return.returns.varType).declaresType();

		var usedNames: { [name: string]: boolean } = {};

		for (var i = 0; i < this.log_arguments.length; i++) {
			if (this.log_arguments[i] instanceof Lang.Logic.EmptyElement)
				continue;

			this.errorIfNot(this.log_arguments[i] instanceof Lang.Logic.Declaration, 'Expected parameter declaration', this.log_arguments[i]);
			if (!this.cs) continue;

			var declaration = <Lang.Logic.Declaration>this.log_arguments[i];
			environment.addScope();
			this.cs = declaration.compile(environment) && this.cs;
			environment.removeScope();

			if (!!usedNames[declaration.name]) {
				this.error("Parameter of this name already exists", declaration);
				continue;
			}
			usedNames[declaration.name] = true;

			if (!declaration.cs) continue;

			var parameter = new Lang.TypeSystem.FunctionParapeterType(
				declaration.name,
				declaration.typeOfVariable,
				declaration instanceof Lang.Logic.Declaration
			);

			this.parameters[this.parameters.length] = parameter;
			this.declarations[this.declarations.length] = declaration;
		}

		if (!this.cs) return false;

		this.functionType = new Lang.TypeSystem.FunctionClassType(this.parameters, Lang.TypeSystem.rValue(returnType));

		return this.cs;
	}

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {

		environment.addScope();
		environment.addClosure();

		this.compileType(environment);

		for (var i = 0; i < this.declarations.length; i++) {
			var declaration = this.declarations[i];
			environment.addElement(declaration.name, declaration.typeOfVariable.varType);
		}

		environment.addElement(this.name, new Lang.TypeSystem.FunctionType(this.functionType));

		var returnsType = this.functionType.returnType.varType;

		environment.addContext(Lang.Compiler.Context.Function);
		environment.addFunctionExpection(this.functionType.returnType.varType);
		var flowState = this.compileBlock(environment, this.log_list);
		this.errorIf(
			flowState != Lang.Compiler.FlowState.Return && !(returnsType instanceof Lang.TypeSystem.InstanceType && returnsType.prototypeType == Lang.TypeSystem.VoidClassObj.typeInstance),
			'Not all code paths return a value',
			this.log_return);
		environment.removeFunctionExpection();
		environment.removeContext();

		this.closure = environment.removeClosure();
		environment.removeScope();

		if (!this.cs) return false;

		environment.addElement(this.name, new Lang.TypeSystem.FunctionType(this.functionType));

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		var fun = this.createFunctionObject(environment, this.closure);

		environment.addOnStack(fun, this.name);

		fun.closure.push(new Lang.Logic.EnclosedValue(
			this.name,
			fun.getCopy()));

		yield Lang.Flow.Operation.memory(this);

		return;
	}

	createFunctionObject(environment: Lang.Environment.Environment, closure: { [name: string]: Lang.TypeSystem.Type }): Lang.TypeSystem.FunctionObj {
		var logicElement = this;

		this.enclosedValues = [];
		for (var key in closure) {
			this.enclosedValues.push(
				new Lang.Logic.EnclosedValue(
					key,
					environment.getFromStack(key).getValue().getCopy()));
		}

		var declarations = [];

		var fun = new Lang.TypeSystem.FunctionObj(
			new Lang.TypeSystem.FunctionClassObj(),
			this.declarations,
			function* (environment: Lang.Environment.Environment) {
				for (var i = 0; i < logicElement.log_list.length; i++) {
					yield* logicElement.log_list[i].run(environment);

					if (environment.flowState == Lang.Environment.FlowState.Return) {
						var value = environment.popFromTempStack().getValue();
						environment.clearCurrentTempScope();
						environment.addOnTempStack(value);
						environment.flowState = Lang.Environment.FlowState.NormalFlow;
						return;
					}
					else {
						environment.clearCurrentTempScope();
					}
				}

				return new Lang.TypeSystem.Obj();
			},
			this.enclosedValues
		);

		return fun;
	}
}