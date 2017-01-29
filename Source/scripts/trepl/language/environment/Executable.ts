import { IEnvironment } from '../../environment'

export interface IExecutableBase {
}

export interface IExecutable<Env extends IEnvironment> extends IExecutableBase {
	execute(environment: Env): IterableIterator<Operation>;
}

export enum OperationType {
	MemoryOperation,
	TempMemoryOperation,
	InternalOperation,
	FlowOperation,
	WaitOperation,
	OtherOperation,
	Done
}

export class Operation {
	constructor(public operationType: OperationType, public element: IExecutableBase) { }

	static memory(element: IExecutableBase): Operation {
		return new Operation(OperationType.MemoryOperation, element);
	}
	static tempMemory(element: IExecutableBase): Operation {
		return new Operation(OperationType.TempMemoryOperation, element);
	}
	static internal(element: IExecutableBase): Operation {
		return new Operation(OperationType.InternalOperation, element);
	}
	static flow(element: IExecutableBase): Operation {
		return new Operation(OperationType.FlowOperation, element);
	}
	static wait(): Operation {
		return new Operation(OperationType.WaitOperation, null);
	}
	static other(element: IExecutableBase): Operation {
		return new Operation(OperationType.OtherOperation, element);
	}
}