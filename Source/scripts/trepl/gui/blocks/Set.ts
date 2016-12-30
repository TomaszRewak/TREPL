import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Set extends Elements.Element {
	getJSONName() { return 'Set' }
	c_left: Components.DropField
	c_right: Components.DropField
	constructor(left: Elements.Element = null, right: Elements.Element = null) {
		super();
		this.c_left = new Components.DropField(this, left),
			this.c_right = new Components.DropField(this, right)
		this.initialize([
			[this.c_left, new Components.Label('='), this.c_right]
		], Elements.ElementType.Variable);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Set(
			this.c_left.constructCode(),
			this.c_right.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Set(
			this.c_left.getContentCopy(),
			this.c_right.getContentCopy()).copyMetadata(this);
	}
}