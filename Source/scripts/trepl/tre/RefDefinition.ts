import * as Lang from '../language'

import { VarDefinition } from './VarDefinition'
import { Ref } from './Ref'

export class RefDefinition extends VarDefinition {
	constructor(
		name: string,
		log_type: Lang.Logic.LogicElement,
		log_value: Lang.Logic.LogicElement
	) {
		super(
			name,
			new Ref(log_type).setAsInternalOperation(),
			log_value
		);
	}
}