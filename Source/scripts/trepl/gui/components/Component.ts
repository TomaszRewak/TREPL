export class Component {
	element: JQuery;
	elemValue: string = null;
	constructor(elemClass = '') {
		this.element = $('<div></div>');
		this.element.addClass(elemClass);
	}
	setValue(val: string) {
		val = val.replace('\n', '');
		this.elemValue = val;
		this.element.empty().append(val);
	}
	addContent(content: JQuery) {
		this.element.append(content);
		this.element.removeAttr('contenteditable');
	}
	propagate(fun: (element: E.Element) => void) { }
}