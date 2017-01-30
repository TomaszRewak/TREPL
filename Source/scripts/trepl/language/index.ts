import { Environment, IMemoryField } from '../environment'
import { ITypedEnvironment } from './environment'

import { Alias } from './type_system'

export class TypedEnvironment extends Environment implements ITypedEnvironment {
	public flowState: FlowState = FlowState.NormalFlow;

	private dereferenceAlias(field: IMemoryField): IMemoryField {
		var fieldValue = field.getValue();

		if (fieldValue instanceof Alias)
			return fieldValue.reference;
		else
			return field;
	}

	getFromStack(name: string): IMemoryField {
		return this.dereferenceAlias(super.getFromStack(name));
	}

	popFromTempStack(): IMemoryField {
		return this.dereferenceAlias(super.popFromTempStack());
	}
}