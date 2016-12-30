import * as Lang from '../language'

import { VarDeclaration } from './VarDeclaration'
import { Ref } from './Ref'

export class RefDeclaration extends VarDeclaration {
	constructor(
		name: string,
		log_type: Lang.Logic.LogicElement
	) {
		super(
			name,
			new Ref(log_type).setAsInternalOperation()
		);
	}
}