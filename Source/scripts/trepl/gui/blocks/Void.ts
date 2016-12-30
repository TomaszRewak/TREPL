import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Void extends Elements.Element {
	getJSONName() { return 'Void' }
	constructor() {
		super();
		this.initialize([
			[new Components.Label('void')]
		], Elements.ElementType.Type);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Void();
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Void().copyMetadata(this);
	}
}