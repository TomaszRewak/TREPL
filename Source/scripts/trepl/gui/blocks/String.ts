import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class String extends Elements.Element {
	getJSONName() { return 'String' }
	constructor() {
		super();
		this.initialize([
			[new Components.Label('string')]
		], Elements.ElementType.Type);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.String();
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new String().copyMetadata(this);
	}
}