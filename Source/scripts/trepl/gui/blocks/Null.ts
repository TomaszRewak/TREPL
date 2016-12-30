import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Null extends Elements.Element {
	getJSONName() { return 'Null' }
	c_name: Components.Label;
	constructor() {
		super();
		this.c_name = new Components.Label('null');
		this.initialize([
			[this.c_name]
		], Elements.ElementType.Value);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Null();
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Null().copyMetadata(this);
	}
}