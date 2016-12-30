import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Int extends Elements.Element {
	getJSONName() { return 'Int' }
	constructor() {
		super();
		this.initialize([
			[new Components.Label('number')]
		], Elements.ElementType.Type);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Int();
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Int().copyMetadata(this);
	}
}