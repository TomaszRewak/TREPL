import { Function } from './Function'
import { } from '../flow'
import { IEnvironment, IMemoryField } from '../../environment'

export class Method<Env extends IEnvironment> extends Function<Env> {
	constructor(
		thisField: IMemoryField,
		baseFunction: Function<Env>,
		alaisedThis: boolean
	) {
		var thisValue = alaisedThis ? null : thisField.getValue().getCopy();
		super(
			baseFunction.prototype,
			baseFunction.parameters,
			alaisedThis ?
				function* (environment: Env) {
					environment.addAliasToStack(
						thisField,
						'this'
					);

					yield* baseFunction.behaviour(environment);
				}
				:
				function* (environment: Env) {
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