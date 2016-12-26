import { Component } from './Component'
import { DropListElement } from './DropListElement'

export class DropList extends Component {
	firstElement: DropListElement;
	lastElement: DropListElement;

	constructor(public parent: E.Element, elemsCotent: E.Element[] = null) {
		super('dropList');
		this.firstElement = this.lastElement = new DropListElement(this);
		this.element.append(this.firstElement.getElement());

		if (elemsCotent) {
			for (var i = 0; i < elemsCotent.length; i++) {
				this.lastElement.attachElement(elemsCotent[i]);
			}
		}
	}
	getLogicComponents(): L.LogicElement[] {
		var elements: L.LogicElement[] = []

		var actualElement = this.firstElement;
		while (actualElement) {
			elements.push(actualElement.constructCode());

			actualElement = actualElement.getNextElement();
		}

		return elements;
	}
	getContentCopy(): E.Element[] {
		var copy: E.Element[] = [];

		var actualElement = this.firstElement;
		while (actualElement) {
			var contentCopy = actualElement.getContentCopy();
			if (contentCopy)
				copy.push(contentCopy);

			actualElement = actualElement.getNextElement();
		}

		return copy;
	}
	edited() {
		this.parent.edited();
	}
	propagate(fun: (element: E.Element) => void) {
		var actualElement = this.firstElement;
		while (actualElement) {
			actualElement.propagate(fun);
			actualElement = actualElement.getNextElement();
		}
	}
	toJSONObject(): Object {
		var jsons = [];

		var actualElement = this.firstElement;
		while (actualElement) {
			var json = actualElement.toJSONObject();
			if (json)
				jsons.push(json);
			actualElement = actualElement.getNextElement();
		}

		return jsons;
	}
}