import * as Lang from '../language'

import { FunctionCall } from './FunctionCall'
import { Path } from './Path'

export class Operator2 extends Lang.Logic.LogicElement {
	constructor(
		private operation: string, // string reprasenting given operation, like -, + etc.
		public log_left: Lang.Logic.LogicElement,
		public log_right: Lang.Logic.LogicElement
	) {
		super();
		this.logicFunction =
			new FunctionCall(
				new Path(this.log_left, this.operation).setAsInternalOperation(),
				[this.log_right]
			).setAsInternalOperation();
	}

	logicFunction: Lang.Logic.LogicElement;

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.cs = this.logicFunction.compile(environment) && this.cs;
		this.errorIfEmpty(this.log_left);
		this.errorIfEmpty(this.log_right);
		if (this.log_left.cs && this.log_right.cs)
			this.errorIfNot(this.cs, 'These two values cannot be aplied to this operator');
		if (!this.cs) return false;

		this.returns = this.logicFunction.returns;

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.logicFunction.run(environment);

		environment.passTempValue();

		yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}