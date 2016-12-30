import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class RawData extends Elements.Element {
	getJSONName() { return 'RawData' }
	c_data: Components.TextField;
	constructor(value: string = 'foo') {
		super();
		this.c_data = new Components.TextField(this, value);
		this.initialize([
			[this.c_data]
		], Elements.ElementType.Value);
		this._isNumber = true;
	}
	constructCode(): Lang.Logic.LogicElement {
		var logic = new TRE.RawData(
			this.c_data.getRawData()
		);
		logic.setObserver(this);
		return logic;
	}
	getCopy(): Elements.Element {
		return new RawData(this.c_data.getRawData()).copyMetadata(this);
	}
	private _isNumber;
	isNumber(num: boolean) {
		if (num != this._isNumber) {
			this._isNumber = num;

			this.clearStyles();
			this.setStyle(num ? Elements.ElementType.Value : Elements.ElementType.Variable);
		}
	}
}