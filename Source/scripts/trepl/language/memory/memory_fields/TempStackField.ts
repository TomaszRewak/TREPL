import {} from './Mem'

export class TempStackField extends MemoryField {
	observer = new MO.TempStackFieldObserver(this);
	constructor(public level: number) {
		super();
	}
}