import * as Lang from '../language'

export class Break extends Lang.Logic.LogicElement {
	constructor() { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.errorIfNot(environment.isInContext(Lang.Compiler.Context.Loop), 'You can use "break" keyword only inside a loop');
		this.flowState = Lang.Compiler.FlowState.Break;

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		environment.flowState = Lang.Environment.FlowState.Break;

		yield Lang.Flow.Operation.flow(this);

		return;
	}
}