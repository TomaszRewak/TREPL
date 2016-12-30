import * as Lang from '../language'

import { If } from './If'

export class Block extends Lang.Logic.LogicElement {
	constructor(
		public log_list: Lang.Logic.LogicElement[]
	) {
		super();
	}

	_compile(environment: Lang.Compiler.TypeEnvironment) {
		environment.addScope();

		this.compileBlock(environment, this.log_list);

		environment.removeScope();

		if (!this.cs) return false;

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		environment.addScope('Block');

		yield Lang.Flow.Operation.memory(this);

		yield* If.executeBlock(environment, this.log_list);

		var removedScope = environment.removeScope();

		yield Lang.Flow.Operation.memory(this);

		return;
	}
}
