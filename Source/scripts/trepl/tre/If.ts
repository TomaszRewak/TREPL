import * as Lang from '../language'

export class If extends Lang.Logic.LogicElement {
	constructor(
		public log_condition: Lang.Logic.LogicElement,
		public log_list: Lang.Logic.LogicElement[]
	) {
		super();
		log_condition.setAsInternalOperation();
	}

	_compile(environment: Lang.Compiler.TypeEnvironment) {
		this.errorIfEmpty(this.log_condition);

		environment.addScope();

		this.cs = this.log_condition.compile(environment) && this.cs;
		this.compileBlock(environment, this.log_list);

		environment.removeScope();

		if (!this.cs) return false;

		this.errorIfTypeMismatch(Lang.TypeSystem.rValue(Lang.TypeSystem.BooleanClassObj.objectTypeInstance), this.log_condition.returns, this.log_condition);

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_condition.run(environment);

		yield Lang.Flow.Operation.flow(this.log_condition);

		var condition = <Lang.TypeSystem.BaseClassInstanceObj>environment.popFromTempStack().getValue();

		if (condition.rawValue) {
			environment.addScope('If body');

			yield Lang.Flow.Operation.memory(this);

			yield* If.executeBlock(environment, this.log_list);

			var removedScope = environment.removeScope();

			yield Lang.Flow.Operation.memory(this);
		}

		return;
	}
}