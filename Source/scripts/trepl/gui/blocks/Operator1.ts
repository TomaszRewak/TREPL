import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

abstract class Operator1 extends Elements.Element {
	c_operand: Components.DropField
	elemType; // class of descent of this class, which defines new operator
	operator: string;
	private hadSideEffects;
	constructor(elemType, operator: string, post: boolean, left: Elements.Element = null, sideEffects: boolean = false) {
		super();
		this.c_operand = new Components.DropField(this, left),
			this.initialize(
				post ?
					[[this.c_operand, new Components.Label(operator)]] :
					[[new Components.Label(operator), this.c_operand]]
				, Elements.ElementType.Math);
		this.elemType = elemType;
		this.operator = post ? '_' + operator : operator;
		this.hadSideEffects = sideEffects;
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Operator1(
			this.operator,
			this.c_operand.constructCode(),
			this.hadSideEffects
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new this.elemType(
			this.c_operand.getContentCopy()).copyMetadata(this);
	}
}

/////////////// Operators ////////////////////

export class Increment extends Operator1 {
	getJSONName() { return 'Increment' }
	constructor(a: Elements.Element = null) {
		super(Increment, '++', false, a, true);
	}
}

export class Decrement extends Operator1 {
	getJSONName() { return 'Decrement' }
	constructor(a: Elements.Element = null) {
		super(Decrement, '--', false, a, true);
	}
}

export class PostIncrement extends Operator1 {
	getJSONName() { return 'PostIncrement' }
	constructor(a: Elements.Element = null) {
		super(PostIncrement, '++', true, a, true);
	}
}

export class PostDecrement extends Operator1 {
	getJSONName() { return 'PostDecrement' }
	constructor(a: Elements.Element = null) {
		super(PostDecrement, '--', true, a, true);
	}
}

export class Print extends Operator1 {
	getJSONName() { return 'Print' }
	constructor(a: Elements.Element = null) {
		super(Print, 'print', false, a, true);
	}
}

export class Read extends Operator1 {
	getJSONName() { return 'Read' }
	constructor(a: Elements.Element = null) {
		super(Read, 'read', false, a, true);
	}
}

export class Not extends Operator1 {
	getJSONName() { return 'Not' }
	constructor(a: Elements.Element = null) {
		super(Not, '!', false, a);
	}
}