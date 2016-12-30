import * as Lang from '../language'

import { FunctionCall } from './FunctionCall'
import { Path } from './Path'

export class Operator1 extends Lang.Logic.LogicElement {
	constructor(
		private operation: string, // string reprasenting given operation, like -, + etc.
		public log_operand: Lang.Logic.LogicElement,
		private hadSideEffects: boolean
	) {
		super();
		this.logicFunction =
			new FunctionCall(
				new Path(this.log_operand, this.operation).setAsInternalOperation(),
				[]
			).setAsInternalOperation();
	}

	logicFunction: Lang.Logic.LogicElement;

	_compile(environment: Lang.Compiler.TypeEnvironment): boolean {
		this.cs = this.logicFunction.compile(environment) && this.cs;
		this.errorIfEmpty(this.log_operand);
		if (this.log_operand.cs)
			this.errorIfNot(this.cs, 'These two values cannot be aplied to this operator');
		if (!this.cs) return false;

		this.returns = this.logicFunction.returns;

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.logicFunction.run(environment);

		environment.passTempValue();

		if (this.hadSideEffects)
			yield Lang.Flow.Operation.memory(this);
		else
			yield Lang.Flow.Operation.tempMemory(this);

		return;
	}
}