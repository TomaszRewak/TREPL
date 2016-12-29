import { MemoryField } from './MemoryField'

export class HeapField extends MemoryField {
	constructor() {
		super();
	}
	observer = new MO.HeapFieldObserver(this);
}