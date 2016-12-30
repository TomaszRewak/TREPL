import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class ReferenceOf extends Elements.Element {
	getJSONName() { return 'ReferenceOf' }
	c_object: Components.DropField
	constructor(
		object: Elements.Element = null) {
		super();
		this.c_object = new Components.DropField(this, object)
		this.initialize([
			[
				new Components.Label('ref of'),
				this.c_object,
			]
		], Elements.ElementType.Value);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.ReferenceOf(
			this.c_object.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new ReferenceOf(
			this.c_object.getContentCopy()).copyMetadata(this);
	}
}