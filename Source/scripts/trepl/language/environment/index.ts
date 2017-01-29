import { IEnvironment, IValue, IMemoryField } from '../../environment'
import { IInstanceDefinition, IInstance, IFunction } from './TypeSystem'
import { Operation } from './Executable'
import { FlowState } from './FlowState'

export { IInstanceDefinition, IInstance, IFunction }
export { Operation }

export { IValue }

export interface ITypedEnvironment extends IEnvironment {
	flowState: FlowState;
}