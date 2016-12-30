import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class ClassDefinition extends Elements.Element {
	getJSONName() { return 'ClassDefinition' }
	c_name: Components.TextField
	c_extends: Components.DropField
	c_list: Components.DropList
	constructor(
		name = 'foo',
		extend: Elements.Element = null,
		list: Elements.Element[] = []) {
		super();
		this.c_name = new Components.TextField(this, name),
			this.c_extends = new Components.DropField(this, extend),
			this.c_list = new Components.DropList(this, list)
		this.initialize([
			[
				new Components.Label('class'),
				this.c_name,
				new Components.Label('extends'),
				this.c_extends,
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
		], Elements.ElementType.Type);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.ClassDefinition(
			this.c_name.getRawData(),
			this.c_extends.constructCode(),
			this.c_list.getLogicComponents()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new ClassDefinition(
			this.c_name.getRawData(),
			this.c_extends.getContentCopy(),
			this.c_list.getContentCopy()).copyMetadata(this);
	}
}