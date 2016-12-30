import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Random extends Elements.Element {
	getJSONName() { return 'Random' }
	constructor() {
		super();
		this.initialize([
			[new Components.Label('random()')]
		], Elements.ElementType.Value);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Random(
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Random().copyMetadata(this);
	}
}