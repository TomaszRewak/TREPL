import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Any extends Elements.Element {
	getJSONName() { return 'Any' }
	constructor() {
		super();
		this.initialize([
			[new Components.Label('any')]
		], Elements.ElementType.Type);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Any();
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Any().copyMetadata(this);
	}
}