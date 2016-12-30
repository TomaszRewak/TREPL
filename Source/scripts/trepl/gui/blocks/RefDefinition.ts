import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class ReferenceDefinition extends Elements.Element {
	getJSONName() { return 'ReferenceDefinition' }
	c_name: Components.TextField
	c_type: Components.DropField
	c_value: Components.DropField
	constructor(name = 'foo', typ: Elements.Element = null, value: Elements.Element = null) {
		super();
		this.c_name = new Components.TextField(this, name)
		this.c_type = new Components.DropField(this, typ)
		this.c_value = new Components.DropField(this, value)
		this.initialize([
			[new Components.Label('ref'), this.c_name, new Components.Label(':'), this.c_type, new Components.Label('='), this.c_value]
		], Elements.ElementType.Variable);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.RefDefinition(
			this.c_name.getRawData(),
			this.c_type.constructCode(),
			this.c_value.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new ReferenceDefinition(
			this.c_name.getRawData(),
			this.c_type.getContentCopy(),
			this.c_value.getContentCopy()).copyMetadata(this);
	}
}