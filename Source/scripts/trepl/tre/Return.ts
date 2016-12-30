import * as Lang from '../language'

export class Return extends Lang.Logic.LogicElement {
	constructor(
		public log_value: Lang.Logic.LogicElement
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_value);
		this.cs = this.log_value.compile(environment) && this.cs;
		this.errorIfNot(environment.isInContext(Lang.Compiler.Context.Function), 'You can return valus only form inside of a function');
		this.errorIfTypeMismatch(Lang.TypeSystem.rValue(environment.getFunctionExpection()), this.log_value.returns, this);
		this.flowState = Lang.Compiler.FlowState.Return;
		if (!this.cs) return false;

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_value.run(environment);

		var value = environment.popFromTempStack().getValue().getCopy();
		environment.addOnTempStack(value);
		environment.flowState = Lang.Environment.FlowState.Return;

		yield Lang.Flow.Operation.flow(this);

		return;
	}
}