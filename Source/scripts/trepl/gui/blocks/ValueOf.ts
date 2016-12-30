import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class ValueOf extends Elements.Element {
	getJSONName() { return 'ValueOf' }
	c_object: Components.DropField
	constructor(
		object: Elements.Element = null) {
		super();
		this.c_object = new Components.DropField(this, object)
		this.initialize([
			[
				new Components.Label('val of'),
				this.c_object,
			]
		], Elements.ElementType.Value);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.ValueOf(
			this.c_object.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new ValueOf(
			this.c_object.getContentCopy()).copyMetadata(this);
	}
}