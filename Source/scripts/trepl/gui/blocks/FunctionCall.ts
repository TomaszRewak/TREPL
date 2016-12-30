import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class FunctionCall extends Elements.Element {
	getJSONName() { return 'FunctionCall' }
	c_name: Components.DropField
	c_arguments: Components.DropList
	constructor(
		neme: Elements.Element = null,
		args: Elements.Element[] = []) {
		super();
		this.c_name = new Components.DropField(this, neme),
			this.c_arguments = new Components.DropList(this, args)
		this.initialize([
			[
				this.c_name,
				new Components.Label('('),
				this.c_arguments,
				new Components.Label(')'),
			],
		], Elements.ElementType.Function);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.FunctionCall(
			this.c_name.constructCode(),
			this.c_arguments.getLogicComponents()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new FunctionCall(
			this.c_name.getContentCopy(),
			this.c_arguments.getContentCopy()).copyMetadata(this);
	}
}