import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class False extends Elements.Element {
	getJSONName() { return 'False' }
	c_name: Components.Label;
	constructor() {
		super();
		this.c_name = new Components.Label('false');
		this.initialize([
			[this.c_name]
		], Elements.ElementType.Value);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.False();
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new False().copyMetadata(this);
	}
}