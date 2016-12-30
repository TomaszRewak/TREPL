import * as Lang from '../language'

import { VarDefinition } from './VarDefinition'
import { DefaultValue } from './DefaultValue'

export class VarDeclaration extends VarDefinition {
	constructor(
		name: string,
		log_type: Lang.Logic.LogicElement
	) {
		super(
			name,
			log_type,
			new DefaultValue(log_type).setAsInternalOperation()
		);
	}
}