import { MemoryField } from './MemoryField'
import * as DataStructures from '../data_structures'

export class StackField extends MemoryField implements DataStructures.INamed {
	observer = new MO.StackFieldObserver(this);
	constructor(public name: string) {
		super();
	}
}