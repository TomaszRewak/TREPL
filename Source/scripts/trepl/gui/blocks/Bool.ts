import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Bool extends Elements.Element {
	getJSONName() { return 'Bool' }
	constructor() {
		super();
		this.initialize([
			[new Components.Label('bool')]
		], Elements.ElementType.Type);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Bool();
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Bool().copyMetadata(this);
	}
}