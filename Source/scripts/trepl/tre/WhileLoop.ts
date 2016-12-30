import * as Lang from '../language'

export class WhileLoop extends Lang.Logic.LogicElement {
	constructor(
		public log_condition: Lang.Logic.LogicElement,
		public log_list: Lang.Logic.LogicElement[]
	) {
		super();
		log_condition.setAsInternalOperation();
	}

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		environment.addScope();

		this.cs = this.log_condition.compile(environment) && this.cs;

		environment.addContext(Lang.Compiler.Context.Loop);
		this.compileBlock(environment, this.log_list);
		environment.removeContext();

		environment.removeScope();

		if (!this.cs) return false;

		this.errorIfTypeMismatch(Lang.TypeSystem.rValue(Lang.TypeSystem.BooleanClassObj.objectTypeInstance), this.log_condition.returns, this.log_condition);

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield Lang.Flow.Operation.memory(this);

		while (true) {
			yield* this.log_condition.run(environment);

			yield Lang.Flow.Operation.flow(this.log_condition);

			var condition = <Lang.TypeSystem.BaseClassInstanceObj>environment.popFromTempStack().getValue();
			environment.clearCurrentTempScope();

			if (!condition.rawValue)
				break;

			environment.addScope('While loop');
			yield* WhileLoop.executeBlock(environment, this.log_list);
			var removedScope = environment.removeScope();

			if (environment.flowState == Lang.Environment.FlowState.Break) {
				environment.flowState = Lang.Environment.FlowState.NormalFlow;
				environment.clearCurrentTempScope();
				break;
			}
			if (environment.flowState == Lang.Environment.FlowState.Return) {
				break;
			}
			else {
				environment.flowState = Lang.Environment.FlowState.NormalFlow;
			}
		}

		//yield Operation.flow(this);

		return;
	}
}