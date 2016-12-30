import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

class ProgramParent implements Elements.ElementParent {
	constructor(private element: Program) {
	}
	detachElement() {
	}
	attachElement(element: Elements.Element) { }
	containsElement() {
		return true;
	}
	edited() {
		try {
			var programm = this.element.constructCode();
			programm.compile(new Lang.Compiler.TypeEnvironment());
		}
		catch (any) {
		}
	}
}

export class Program extends Elements.Element {
	getJSONName() { return 'Program' }
	c_list: Components.DropList;
	constructor(list: Elements.Element[] = []) {
		super();
		this.c_list = new Components.DropList(this, list);
		this.initialize([
			[new Components.Label('|>')],
			[this.c_list],
			[new Components.Label('')],
		], Elements.ElementType.Program);
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.Programm(
			this.c_list.getLogicComponents()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new Program(this.c_list.getContentCopy()).copyMetadata(this);
	}
}