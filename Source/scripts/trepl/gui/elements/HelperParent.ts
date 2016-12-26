import { ElementParent } from './ElementParent'
import { Element } from './Element'

export class HelperParent implements ElementParent {
	constructor(private element: Element) {
	}
	detachElement() {
		var newHelper = this.element.getCopy();
		newHelper.getElement().insertAfter(this.element.getElement());
		this.element.parent = null;
	}
	attachElement(element: Element) { }
	containsElement() {
		return true;
	}
	edited() {
	}
}