import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

import { Any } from './Any'

export class BaseClassDefinition extends Elements.Element {
	getJSONName() { return 'BaseClassDefinition' }
	c_name: Components.TextField
	c_list: Components.DropList
	constructor(
		name = 'foo',
		list: Elements.Element[] = []) {
		super();
		this.c_name = new Components.TextField(this, name),
			this.c_list = new Components.DropList(this, list)
		this.initialize([
			[
				new Components.Label('class'),
				this.c_name,
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
			new Any(),
			this.c_list.getLogicComponents()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new BaseClassDefinition(
			this.c_name.getRawData(),
			this.c_list.getContentCopy()).copyMetadata(this);
	}
}