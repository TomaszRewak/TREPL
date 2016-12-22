import { FunctionObj } from './Function'
import { MemoryField } from '../memory_fields/MemoryField'

export class Method extends FunctionObj {
	constructor(
		thisField: MemoryField,
		baseFunction: FunctionObj,
		alaisedThis: boolean
	) {
		var thisValue = alaisedThis ? null : thisField.getValue().getCopy();
		super(
			baseFunction.prototype,
			baseFunction.parameters,
			alaisedThis ?
				function* (environment: Memory.Environment) {
					environment.addAliasToStack(
						thisField,
						'this'
					);

					yield* baseFunction.behaviour(environment);
				}
				:
				function* (environment: Memory.Environment) {
					environment.addValueToStack(
						thisValue.getCopy(),
						'this'
					);

					yield* baseFunction.behaviour(environment);
				},
			baseFunction.closure
		);
	}
}