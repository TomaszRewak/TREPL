import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Path extends Elements.Element {
	getJSONName() { return 'Path' }
	c_left: Components.DropField
	c_right: Components.PenetratingTextField
	constructor(element: Elements.Element = null, name = 'foo') {
		super();
		this.c_left = new Components.DropField(this, element)
		this.c_right = new Components.PenetratingTextField(this, name)
		this.initialize([
			[this.c_left, new Components.Label('.'), this.c_right]
		], Elements.ElementType.Type);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Path(
			this.c_left.constructCode(),
			this.c_right.getRawData()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Path(
			this.c_left.getContentCopy(),
			this.c_right.getRawData()).copyMetadata(this);
	}
}