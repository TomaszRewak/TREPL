import * as Elements from '../elements'
import * as Components from '../components'
import * as Language from '../../language'
import * as TRE from '../../tre'

export class AliasDeclaration extends Elements.Element {
	getJSONName() { return 'AliasDeclaration' }
	c_name: Components.TextField
	c_type: Components.DropField
	constructor(name = 'foo', typ: Elements.Element = null, value: Elements.Element = null) {
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
		], Elements.ElementType.Variable);
	}
	constructCode(): Language.Logic.LogicElement {
		var logic = new TRE.AliasDeclaration(
			this.c_name.getRawData(),
			this.c_type.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new AliasDeclaration(
			this.c_name.getRawData(),
			this.c_type.getContentCopy()).copyMetadata(this);
	}
}