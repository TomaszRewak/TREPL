import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Break extends Elements.Element {
	getJSONName() { return 'Break' }
	constructor(mesage: Elements.Element = null) {
		super();
		this.initialize([
			[
				new Components.Label('break'),
			]
		], Elements.ElementType.Flow);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Break();
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Break().copyMetadata(this);
	}
}