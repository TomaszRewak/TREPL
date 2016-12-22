import { LogicElement } from './LogicElement'

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
	constructor(public operationType: OperationType, public element: LogicElement) { }

	static memory(element: LogicElement): Operation {
		return new Operation(OperationType.MemoryOperation, element);
	}
	static tempMemory(element: LogicElement): Operation {
		return new Operation(OperationType.TempMemoryOperation, element);
	}
	static internal(element: LogicElement): Operation {
		return new Operation(OperationType.InternalOperation, element);
	}
	static flow(element: LogicElement): Operation {
		return new Operation(OperationType.FlowOperation, element);
	}
	static wait(): Operation {
		return new Operation(OperationType.WaitOperation, null);
	}
	static other(element: LogicElement): Operation {
		return new Operation(OperationType.OtherOperation, element);
	}
}