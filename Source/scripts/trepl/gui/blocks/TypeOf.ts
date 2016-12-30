import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class TypeOf extends Elements.Element {
	getJSONName() { return 'TypeOf' }
	c_object: Components.DropField
	constructor(
		object: Elements.Element = null) {
		super();
		this.c_object = new Components.DropField(this, object)
		this.initialize([
			[
				new Components.Label('type of'),
				this.c_object,
			]
		], Elements.ElementType.Type);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.TypeOf(
			this.c_object.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new TypeOf(
			this.c_object.getContentCopy()).copyMetadata(this);
	}
}