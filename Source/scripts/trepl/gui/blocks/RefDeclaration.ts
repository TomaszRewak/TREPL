import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class ReferenceDeclaration extends Elements.Element {
	getJSONName() { return 'ReferenceDeclaration' }
	c_name: Components.TextField
	c_type: Components.DropField
	constructor(name = 'foo', typ: Elements.Element = null) {
		super();
		this.c_name = new Components.TextField(this, name)
		this.c_type = new Components.DropField(this, typ)
		this.initialize([
			[new Components.Label('ref'), this.c_name, new Components.Label(':'), this.c_type]
		], Elements.ElementType.Variable);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.RefDeclaration(
			this.c_name.getRawData(),
			this.c_type.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new ReferenceDeclaration(
			this.c_name.getRawData(),
			this.c_type.getContentCopy()).copyMetadata(this);
	}
}