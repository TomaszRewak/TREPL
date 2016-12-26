import { Component } from './Component'

export class Label extends Component {
	constructor(public elemValue: string) {
		super('label');
		this.setValue(elemValue);
	}
	getValue(): string {
		return this.elemValue;
	}
}