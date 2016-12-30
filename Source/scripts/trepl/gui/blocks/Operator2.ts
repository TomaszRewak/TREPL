import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

abstract class Operator2 extends Elements.Element {
	c_left: Components.DropField
	c_right: Components.DropField
	elemType; // class of descent of this class, which defines new operator
	operator: string;
	constructor(elemType, operator: string, left: Elements.Element = null, right: Elements.Element = null) {
		super();
		this.c_left = new Components.DropField(this, left),
			this.c_right = new Components.DropField(this, right)
		this.initialize([  // TODO: Zmienić
			[
				this.c_left,
				new Components.Label(operator),
				this.c_right
			]
		], Elements.ElementType.Math);
		this.elemType = elemType;
		this.operator = operator;
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Operator2(
			this.operator,
			this.c_left.constructCode(),
			this.c_right.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new this.elemType(
			this.c_left.getContentCopy(),
			this.c_right.getContentCopy()).copyMetadata(this);
	}
}

/////////////// Operators ////////////////////

export class Add extends Operator2 {
	getJSONName() { return 'Add' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(Add, '+', a, b);
	}
}

export class Substract extends Operator2 {
	getJSONName() { return 'Substract' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(Substract, '-', a, b);
	}
}

export class Multiply extends Operator2 {
	getJSONName() { return 'Multiply' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(Multiply, '*', a, b);
	}
}

export class Divide extends Operator2 {
	getJSONName() { return 'Divide' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(Divide, '/', a, b);
	}
}

export class Equal extends Operator2 {
	getJSONName() { return 'Equal' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(Equal, '==', a, b);
	}
}

export class NotEqual extends Operator2 {
	getJSONName() { return 'NotEqual' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(NotEqual, '!=', a, b);
	}
}

export class Less extends Operator2 {
	getJSONName() { return 'Less' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(Less, '<', a, b);
	}
}

export class LessEqual extends Operator2 {
	getJSONName() { return 'LessEqual' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(LessEqual, '<=', a, b);
	}
}

export class More extends Operator2 {
	getJSONName() { return 'More' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(More, '>', a, b);
	}
}

export class MoreEqual extends Operator2 {
	getJSONName() { return 'MoreEqual' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(MoreEqual, '>=', a, b);
	}
}

export class Modulo extends Operator2 {
	getJSONName() { return 'Modulo' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(Modulo, '%', a, b);
	}
}

export class And extends Operator2 {
	getJSONName() { return 'And' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(And, '&&', a, b);
	}
}

export class Or extends Operator2 {
	getJSONName() { return 'Or' }
	constructor(a: Elements.Element = null, b: Elements.Element = null) {
		super(Or, '||', a, b);
	}
}