import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class IfElse extends Elements.Element {
	getJSONName() { return 'IfElse' }
	c_condition: Components.DropField
	c_listTrue: Components.DropList
	c_listFalse: Components.DropList
	constructor(
		cond: Elements.Element = null,
		listTrue: Elements.Element[] = [],
		listFalse: Elements.Element[] = []) {
		super();
		this.c_condition = new Components.DropField(this, cond)
		this.c_listTrue = new Components.DropList(this, listTrue)
		this.c_listFalse = new Components.DropList(this, listFalse)
		this.initialize([
			[
				new Components.Label('if ('),
				this.c_condition,
				new Components.Label(')'),
			],
			[new Components.Label('{'),],
			[this.c_listTrue],
			[new Components.Label('}')],
			[new Components.Label('else')],
			[new Components.Label('{')],
			[this.c_listFalse],
			[new Components.Label('}')]
		], Elements.ElementType.Flow);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.IfElse(
			this.c_condition.constructCode(),
			this.c_listTrue.getLogicComponents(),
			this.c_listFalse.getLogicComponents()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new IfElse(
			this.c_condition.getContentCopy(),
			this.c_listTrue.getContentCopy(),
			this.c_listFalse.getContentCopy()).copyMetadata(this);
	}
}