import * as Lang from '../language'

export class Scope extends Lang.Logic.LogicElement {
	constructor(
		public log_list: Lang.Logic.LogicElement[]
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		for (var i = 0; i < this.log_list.length; i++)
			this.cs = this.log_list[i].compile(environment) && this.cs;

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {

		environment.addScope('Scope');

		yield Lang.Flow.Operation.memory(this);

		for (var i = 0; i < this.log_list.length; i++)
			yield* this.log_list[i].run(environment);

		environment.removeScope();

		yield Lang.Flow.Operation.memory(this);

		return;
	}
}