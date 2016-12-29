import { TempStackField } from './TempStackField'

export class AliasTempStackField extends TempStackField {
	observer = new MO.TempStackFieldObserver(this);
	constructor(public level: number) {
		super(level);
	}
}