import { Element } from '../elements/Element'
import * as Components from '../components'

export class AliasDeclaration extends Element {
	getJSONName() { return 'AliasDeclaration' }
	c_name: Components.TextField
	c_type: Components.DropField
	constructor(name = 'foo', typ: Element = null, value: Element = null) {
		super();
		this.c_name = new Components.TextField(this, name)
		this.c_type = new Components.DropField(this, typ)
		this.initialize([
			[
				new Components.Label('alias'),
				this.c_name,
				new Components.Label(':'),
				this.c_type,
			]
		],
			ElementType.Variable);
	}
	constructCode(): L.LogicElement {
		var logic = new L.AliasDeclaration(
			this.c_name.getRawData(),
			this.c_type.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Element {
		return new AliasDeclaration(
			this.c_name.getRawData(),
			this.c_type.getContentCopy()).copyMetadata(this);
	}
}