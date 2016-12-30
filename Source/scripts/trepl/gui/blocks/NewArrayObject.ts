import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class NewArray extends Elements.Element {
	getJSONName() { return 'NewArray' }
	c_type: Components.DropField
	c_size: Components.DropField
	constructor(
		typ: Elements.Element = null,
		size: Elements.Element = null) {
		super();
		this.c_type = new Components.DropField(this, typ),
			this.c_size = new Components.DropField(this, size);
		this.initialize([
			[
				new Components.Label('new'),
				this.c_type,
				new Components.Label('['),
				this.c_size,
				new Components.Label(']'),
			],
		], Elements.ElementType.Value);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.NewArrayObject(
			this.c_type.constructCode(),
			this.c_size.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new NewArray(
			this.c_type.getContentCopy(),
			this.c_size.getContentCopy()).copyMetadata(this);
	}
}