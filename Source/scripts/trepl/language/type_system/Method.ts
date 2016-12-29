import * as Function from './Function'
import * as MemoryFields from '../memory_fields'

export class Method extends Function.FunctionObj {
	constructor(
		thisField: MemoryFields.MemoryField,
		baseFunction: Function.FunctionObj,
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