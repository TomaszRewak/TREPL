import { MemoryField } from './MemoryField'
import { INamed } from '../data_structures/INamed'

export class StackField extends MemoryField implements INamed {
	observer = new MO.StackFieldObserver(this);
	constructor(public name: string) {
		super();
	}
}