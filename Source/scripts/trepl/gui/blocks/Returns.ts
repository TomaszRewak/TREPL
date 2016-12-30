import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Return extends Elements.Element {
	getJSONName() { return 'Return' }
	c_value: Components.DropField
	constructor(mesage: Elements.Element = null) {
		super();
		this.c_value = new Components.DropField(this, mesage)
		this.initialize([
			[
				new Components.Label('return'),
				this.c_value,
			]
		], Elements.ElementType.Function);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Return(
			this.c_value.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Return(
			this.c_value.getContentCopy()).copyMetadata(this);
	}
}