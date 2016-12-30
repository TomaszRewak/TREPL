import * as Lang from '../language'

export class FunctionCall extends Lang.Logic.LogicElement {
	constructor(
		public log_name: Lang.Logic.LogicElement,
		public log_arguments: Lang.Logic.LogicElement[]
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_name);
		this.cs = this.log_name.compile(environment) && this.cs;
		if (!this.cs) return false;

		this.errorIfNot(this.log_name.returns.varType instanceof Lang.TypeSystem.FunctionType, 'Expected function', this.log_name);
		if (!this.cs) return false;

		var fun = <Lang.TypeSystem.FunctionType>this.log_name.returns.varType;
		var funType = fun.prototypeType;

		var passedArguments: Lang.Logic.LogicElement[] = [];

		for (var i = 0; i < this.log_arguments.length; i++) {
			var argument = this.log_arguments[i];

			this.cs = argument.compile(environment) && this.cs;

			if (argument instanceof Lang.Logic.EmptyElement)
				continue;

			if (!argument.cs) continue;

			this.errorIfTypeMismatch(funType.parameters[passedArguments.length].paramType, argument.returns, argument);

			passedArguments.push(argument);
		}

		this.errorIf(passedArguments.length != funType.parameters.length, 'Number of paramteres and number of anguments do not match');
		if (!this.cs) return false;

		this.returns = funType.returnType;

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		var passedArguments = 0;
		for (var i = this.log_arguments.length - 1; i >= 0; i--) {
			if (this.log_arguments[i] instanceof Lang.Logic.EmptyElement)
				continue;

			yield* this.log_arguments[i].run(environment);
			passedArguments++;
		}
		yield* this.log_name.run(environment);

		var fun = <Lang.TypeSystem.FunctionObj>environment.popFromTempStack().getValue();

		yield Lang.Flow.Operation.flow(this);

		yield* fun.call(environment, passedArguments);

		return;
	}
}