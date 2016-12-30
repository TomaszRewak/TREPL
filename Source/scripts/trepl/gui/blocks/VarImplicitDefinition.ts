import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class VariableImplicitDefinition extends Elements.Element {
	getJSONName() { return 'VariableImplicitDefinition' }
	c_name: Components.TextField
	c_value: Components.DropField
	constructor(name = 'foo', value: Element = null) {
		super();
		this.c_name = new Components.TextField(this, name)
		this.c_value = new Components.DropField(this, value)
		this.initialize([
			[new Components.Label('var'), this.c_name, new Components.Label('='), this.c_value]
		], Elements.ElementType.Variable);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.VarImplicitDefinition(
			this.c_name.getRawData(),
			this.c_value.constructCode()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new VariableImplicitDefinition(
			this.c_name.getRawData(),
			this.c_value.getContentCopy()).copyMetadata(this);
	}
}