import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class StringLiteral extends Elements.Element {
	getJSONName() { return 'StringLiteral' }
	c_data: Components.TextField;
	constructor(value: string = 'foo') {
		super();
		this.c_data = new Components.TextField(this, value);
		this.initialize([
			[new Components.Label('"'), this.c_data, new Components.Label('"')]
		], Elements.ElementType.Value);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.StringLiteral(
			this.c_data.getRawData()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new StringLiteral(this.c_data.getRawData()).copyMetadata(this);
	}
}