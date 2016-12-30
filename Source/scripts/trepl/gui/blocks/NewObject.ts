import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class NewObject extends Elements.Element {
	getJSONName() { return 'NewObject' }
	c_type: Components.DropField
	c_arguments: Components.DropList
	constructor(
		typ: Elements.Element = null,
		argumets: Elements.Element[] = []) {
		super();
		this.c_type = new Components.DropField(this, typ),
			this.c_arguments = new Components.DropList(this, argumets)
		this.initialize([
			[
				new Components.Label('val'),
				this.c_type,
				new Components.Label('('),
				this.c_arguments,
				new Components.Label(')'),
			],
		], Elements.ElementType.Value);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.NewObject(
			this.c_type.constructCode(),
			this.c_arguments.getLogicComponents()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new NewObject(
			this.c_type.getContentCopy(),
			this.c_arguments.getContentCopy()).copyMetadata(this);
	}
}