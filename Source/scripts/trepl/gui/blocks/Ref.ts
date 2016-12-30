import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Ref extends Elements.Element {
	getJSONName() { return 'Ref' }
	c_type: Components.DropField
	constructor(typ: Element = null) {
		super();
		this.c_type = new Components.DropField(this, typ)
		this.initialize([
			[
				this.c_type,
				new Components.Label('ref'),
			]
		], Elements.ElementType.Type);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Ref(
			this.c_type.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Ref(
			this.c_type.getContentCopy()
		).copyMetadata(this);
	}
}