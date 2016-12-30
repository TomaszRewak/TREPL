import * as Lang from '../language'

export class Set extends Lang.Logic.LogicElement {
	constructor(
		public log_left: Lang.Logic.LogicElement,
		public log_right: Lang.Logic.LogicElement
	) { super(); }

	_compile(environment: Lang.Compiler.TypeEnvironment) {
		this.errorIfEmpty(this.log_left);
		this.errorIfEmpty(this.log_right);
		this.cs = this.log_right.compile(environment) && this.cs;
		this.cs = this.log_left.compile(environment) && this.cs;

		if (!this.cs) return false;

		this.errorIfNot(this.log_left.returns instanceof Lang.TypeSystem.LValue, 'Expected L-value', this.log_left);
		if (!this.cs) return false;

		var leftType = this.log_left.returns.varType;
		var rightType = this.log_right.returns.varType;

		this.errorIfNot(leftType instanceof Lang.TypeSystem.InstanceType, 'Expected type instance', this.log_left);
		this.errorIfNot(rightType instanceof Lang.TypeSystem.InstanceType, 'Expected type instance', this.log_right);
		if (!this.cs) return false;

		this.errorIfTypeMismatch(Lang.TypeSystem.rValue(leftType), this.log_right.returns, this.log_right);
		if (!this.cs) return false;

		return this.cs;
	}

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		yield* this.log_right.run(environment);
		yield* this.log_left.run(environment);

		var valueLeft = environment.popFromTempStack();
		var valueRight = environment.popFromTempStack();

		valueLeft.setValue(valueRight.getValue().getCopy());
		//environment.pushTempValue(valueRight.getValue().getCopy());

		yield Lang.Flow.Operation.memory(this);

		return;
	}
}
