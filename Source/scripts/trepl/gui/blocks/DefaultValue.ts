import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class DefaultValue extends Elements.Element {
	getJSONName() { return 'DefaultValue' }
	c_type: Components.DropField
	constructor(
		typ: Elements.Element = null) {
		super();
		this.c_type = new Components.DropField(this, typ),
			this.initialize([
				[
					new Components.Label('default value'),
					this.c_type,
				],
			], Elements.ElementType.Value);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.DefaultValue(
			this.c_type.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new DefaultValue(
			this.c_type.getContentCopy()).copyMetadata(this);
	}
}