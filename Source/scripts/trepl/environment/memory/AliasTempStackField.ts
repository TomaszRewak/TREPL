import { TempStackField } from './TempStackField'

export class AliasTempStackField extends TempStackField {
	constructor(public level: number) {
		super(level);
	}
}