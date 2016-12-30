import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class True extends Elements.Element {
	getJSONName() { return 'True' }
	c_name: Components.Label;
	constructor() {
		super();
		this.c_name = new Components.Label('true');
		this.initialize([
			[this.c_name]
		], Elements.ElementType.Value);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.True();
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new True().copyMetadata(this);
	}
}