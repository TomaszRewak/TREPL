import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Function extends Elements.Element {
	getJSONName() { return 'Function' }
	c_name: Components.TextField
	c_arguments: Components.DropList
	c_return: Components.DropField
	c_list: Components.DropList
	constructor(
		name = 'foo',
		args: Elements.Element[] = [],
		returns: Elements.Element = null,
		list: Elements.Element[] = []) {
		super();
		this.c_name = new Components.TextField(this, name)
		this.c_arguments = new Components.DropList(this, args)
		this.c_return = new Components.DropField(this, returns)
		this.c_list = new Components.DropList(this, list)
		this.initialize([  // TODO: Zmienić
			[
				this.c_name,
				new Components.Label('('),
				this.c_arguments,
				new Components.Label('):'),
				this.c_return,
			],
			[
				new Components.Label('{'),],
			[
				this.c_list,
			],
			[
				new Components.Label('}'),
			]
		], Elements.ElementType.Function);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Function(
			this.c_name.getRawData(),
			this.c_arguments.getLogicComponents(),
			this.c_return.constructCode(),
			this.c_list.getLogicComponents()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Function(
			this.c_name.getRawData(),
			this.c_arguments.getContentCopy(),
			this.c_return.getContentCopy(),
			this.c_list.getContentCopy()).copyMetadata(this);
	}
}