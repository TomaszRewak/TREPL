import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class WhileLoop extends Elements.Element {
	getJSONName() { return 'WhileLoop' }
	c_condition: Components.DropField
	c_list: Components.DropList
	constructor(
		cond: Elements.Element = null,
		list: Elements.Element[] = []) {
		super();
		this.c_condition = new Components.DropField(this, cond)
		this.c_list = new Components.DropList(this, list)
		this.initialize([
			[
				new Components.Label('while ('),
				this.c_condition,
				new Components.Label(')'),
			],
			[
				new Components.Label('{'),
			],
			[
				this.c_list,
			],
			[
				new Components.Label('}'),
			]
		], Elements.ElementType.Flow);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.WhileLoop(
			this.c_condition.constructCode(),
			this.c_list.getLogicComponents()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new WhileLoop(
			this.c_condition.getContentCopy(),
			this.c_list.getContentCopy()).copyMetadata(this);
	}
}