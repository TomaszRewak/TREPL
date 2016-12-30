import * as Lang from '../language'

import { VarDefinition } from './VarDefinition'
import { TypeOf } from './TypeOf'

export class VarImplicitDefinition extends VarDefinition {
	constructor(
		public name: string,
		public log_value: Lang.Logic.LogicElement
	) {
		super(
			name,
			new TypeOf(log_value).setAsInternalOperation(),
			log_value
		);
	}
}