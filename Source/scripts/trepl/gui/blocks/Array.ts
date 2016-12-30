import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Array extends Elements.Element {
	getJSONName() { return 'Array' }
	c_type: Components.DropField;
	c_length: Components.TextField;
	constructor(typ: Elements.Element = null, value: string = '4') {
		super();
		this.c_type = new Components.DropField(this, typ)
		this.c_length = new Components.TextField(this, value);
		this.initialize([
			[
				this.c_type,
				new Components.Label('['),
				this.c_length,
				new Components.Label(']'),
			]
		], Elements.ElementType.Type);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Array(
			this.c_type.constructCode(),
			this.c_length.getRawData()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Array(
			this.c_type.getContentCopy(),
			this.c_length.getRawData()
		).copyMetadata(this);
	}
}