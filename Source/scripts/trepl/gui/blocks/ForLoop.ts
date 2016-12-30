import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class ForLoop extends Elements.Element {
	getJSONName() { return 'ForLoop' }
	c_init: Components.DropField
	c_condition: Components.DropField
	c_operation: Components.DropField
	c_list: Components.DropList
	constructor(
		init: Elements.Element = null,
		cond: Elements.Element = null,
		oper: Elements.Element = null,
		list: Elements.Element[] = []) {
		super();
		this.c_init = new Components.DropField(this, init)
		this.c_condition = new Components.DropField(this, cond)
		this.c_operation = new Components.DropField(this, oper)
		this.c_list = new Components.DropList(this, list)
		this.initialize([  // TODO: Zmienić
			[
				new Components.Label('for ('),
				this.c_init,
				new Components.Label('; '),
				this.c_condition,
				new Components.Label('; '),
				this.c_operation,
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
		var logic = new TRE.ForLoop(
			this.c_init.constructCode(),
			this.c_condition.constructCode(),
			this.c_operation.constructCode(),
			this.c_list.getLogicComponents()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new ForLoop(
			this.c_init.getContentCopy(),
			this.c_condition.getContentCopy(),
			this.c_operation.getContentCopy(),
			this.c_list.getContentCopy()).copyMetadata(this);
	}
}