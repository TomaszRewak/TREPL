import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class ElementAt extends Elements.Element { // Add implementation
	getJSONName() { return 'ElementAt' }
	c_array: Components.DropField
	c_index: Components.DropField
	constructor(
		array: Elements.Element = null,
		index: Elements.Element = null) {
		super();
		this.c_array = new Components.DropField(this, array),
			this.c_index = new Components.DropField(this, index),
			this.initialize([
				[
					this.c_array,
					new Components.Label('['),
					this.c_index,
					new Components.Label(']'),
				],
			], Elements.ElementType.Value);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.ElementAt(
			this.c_array.constructCode(),
			this.c_index.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new ElementAt(
			this.c_array.getContentCopy(),
			this.c_index.getContentCopy()).copyMetadata(this);
	}
}