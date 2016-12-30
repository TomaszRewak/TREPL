import * as Lang from '../language'

export class IfElse extends Lang.Logic.LogicElement {
	constructor(
		public log_condition: Lang.Logic.LogicElement,
		public log_listTrue: Lang.Logic.LogicElement[],
		public log_listFalse: Lang.Logic.LogicElement[]
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfEmpty(this.log_condition);

		environment.addScope();

		this.cs = this.log_condition.compile(environment) && this.cs;

		environment.addScope();
		var flowState1 = this.compileBlock(environment, this.log_listTrue);
		environment.removeScope();
		environment.addScope();
		var flowState2 = this.compileBlock(environment, this.log_listFalse);
		environment.removeScope();

		this.flowState = Math.min(flowState1, flowState2);

		environment.removeScope();

		if (!this.cs) return false;

		this.errorIfTypeMismatch(Lang.TypeSystem.rValue(Lang.TypeSystem.BooleanClassObj.objectTypeInstance), this.log_condition.returns, this.log_condition);

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_condition.run(environment);
		var condition = <Lang.TypeSystem.BaseClassInstanceObj>environment.popFromTempStack().getValue();

		yield Lang.Flow.Operation.flow(this);

		if (condition.rawValue) {
			environment.addScope('If body');

			yield Lang.Flow.Operation.memory(this);

			yield* IfElse.executeBlock(environment, this.log_listTrue);

			var removedScope = environment.removeScope();

			yield Lang.Flow.Operation.memory(this);
		}
		else {
			environment.addScope('Else body');

			yield Lang.Flow.Operation.memory(this);

			yield* IfElse.executeBlock(environment, this.log_listFalse);

			var removedScope = environment.removeScope();

			yield Lang.Flow.Operation.memory(this);
		}

		return;
	}
}