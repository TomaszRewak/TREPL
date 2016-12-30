import * as Lang from '../language'

export class Programm extends Lang.Logic.LogicElement {
	constructor(
		public log_list: Lang.Logic.LogicElement[]
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.compileBlock(environment, this.log_list);

		return this.cs;
	}

	*run(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* Lang.Logic.LogicElement.prototype.run.call(this, environment);

		environment.clearCurrentTempScope();

		return;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		environment.flowState = Lang.Environment.FlowState.NormalFlow;

		yield* Programm.executeBlock(environment, this.log_list);

		return;
	}
}