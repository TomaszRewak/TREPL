import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class VariableDeclaration extends Elements.Element {
	getJSONName() { return 'VariableDeclaration' }
	c_name: Components.TextField
	c_type: Components.DropField
	constructor(name: string = 'foo', typ: Elements.Element = null) {
		super();
		this.c_name = new Components.TextField(this, name)
		this.c_type = new Components.DropField(this, typ)
		this.initialize([
			[new Components.Label('var'), this.c_name, new Components.Label(':'), this.c_type]
		], Elements.ElementType.Variable);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.VarDeclaration(
			this.c_name.getRawData(),
			this.c_type.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new VariableDeclaration(
			this.c_name.getRawData(),
			this.c_type.getContentCopy()).copyMetadata(this);
	}
}