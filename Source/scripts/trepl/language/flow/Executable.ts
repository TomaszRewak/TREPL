import * as Environment from '../environment/Environment'

export interface Executable {
	execute(environment: Environment.Environment): IterableIterator<Operation>;
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
	constructor(public operationType: OperationType, public element: Executable) { }

	static memory(element: Executable): Operation {
		return new Operation(OperationType.MemoryOperation, element);
	}
	static tempMemory(element: Executable): Operation {
		return new Operation(OperationType.TempMemoryOperation, element);
	}
	static internal(element: Executable): Operation {
		return new Operation(OperationType.InternalOperation, element);
	}
	static flow(element: Executable): Operation {
		return new Operation(OperationType.FlowOperation, element);
	}
	static wait(): Operation {
		return new Operation(OperationType.WaitOperation, null);
	}
	static other(element: Executable): Operation {
		return new Operation(OperationType.OtherOperation, element);
	}
}