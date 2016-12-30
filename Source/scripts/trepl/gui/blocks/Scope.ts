import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Scope extends Elements.Element {
	getJSONName() { return 'Scope' }
	c_list: Components.DropList
	constructor(elements: Elements.Element[] = []) {
		super();
		this.c_list = new Components.DropList(this, elements)
		this.initialize([
			[new Components.Label('{')],
			[this.c_list],
			[new Components.Label('}')]
		], Elements.ElementType.Flow);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Scope(
			this.c_list.getLogicComponents()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Scope(
			this.c_list.getContentCopy()).copyMetadata(this);
	}
}