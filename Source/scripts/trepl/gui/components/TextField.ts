import { Component } from './Component'

export class TextField extends Component {
	constructor(private parent: E.Element, elemValue: string = null) {
		super('textField');
		GUI.makeEditable(this.element, parent);
		this.element.on('input', () => {
			parent.edited();
		});
		this.element.focus(() => {
			BufferManager.getBuffer().setSelectedElement(parent);
		});
		this.setValue(elemValue);
	}
	getRawData(): string {
		return this.element.text();
	}
	toJSONObject(): Object {
		return this.getRawData();
	}
}