import * as DataStructures from '../data_structures'
import * as Memory from '../memory'

export enum FlowState {
	NormalFlow,
	Return,
	Break,
	Continue,
}

export class Environment {
	private stack: DataStructures.StackMap<Memory.StackField, Memory.StackScope> = new DataStructures.StackMap<Memory.StackField, Memory.StackScope>();
	observer = MO.getEnvironmentObserver();

	constructor() {
		this.addScope('Environment');
	}
	addOnStack(val: Memory.Value, name: string) {
		if (this.stack.hasElement(name)) {
			this.stack.getElement(name).observer.visible(false);
		}

		var field = new Memory.StackField(name);
		field.setValue(val);
		this.stack.addElement(field);
		this.observer.addFieldToStack(field);
	}
	getFromStack(name: string): Memory.MemoryField {
		var field = this.stack.getElement(name);

		var dereferenced = field.getValue().dereference();
		return dereferenced ? dereferenced : field;
	}
	addScope(name: string) {
		if (this.stack.hasScope())
			this.stack.getScope().observer.visible(false);
		var scope = new Memory.StackScope(name);
		this.stack.addScope(scope);
		this.observer.addScopeToStack(scope);
	}
	removeScope() {
		var removedScope = this.stack.removeScope();

		var stack = removedScope.stack;
		while (stack) {
			var field = stack.top;
			this.observer.removeFieldFromStack(field);
			if (this.stack.hasElement(field.name))
				this.stack.getElement(field.name).observer.visible(true);
			stack = stack.tail;
		}

		this.observer.removeScopeFromStack(removedScope);
		if (this.stack.hasScope())
			this.stack.getScope().observer.visible(true);
	}

	// Heap
	private heap: DataStructures.Stack<Memory.HeapField> = null;
	addToHeap(val: Memory.Value): Memory.HeapField {
		var field = new Memory.HeapField();
		field.setValue(val);
		// TODO?
		this.heap = DataStructures.Stack.push(field, this.heap);
		this.observer.addFieldToHeap(field);

		return field;
	}

	// Manages scopes for temporery values (like the resault of applying math operatos)
	private tempStackLevel: number = 0;
	private tempStackTop: DataStructures.Stack<Memory.TempStackField> = null;
	addOnTempStack(value: Memory.Value) {
		var newStackField = new Memory.TempStackField(this.tempStackLevel);
		newStackField.setValue(value);
		this.tempStackTop = DataStructures.Stack.push(newStackField, this.tempStackTop);
		this.observer.addFieldToTempStack(newStackField);
	}
	popFromTempStack(): Memory.MemoryField {
		var field = DataStructures.Stack.top(this.tempStackTop);
		this.tempStackTop = DataStructures.Stack.pop(this.tempStackTop);
		this.observer.removeFieldFromTempStack(field);

		var dereferenced = field.getValue().dereference();
		return dereferenced ? dereferenced : field;
	}
	addTempScope() {
		this.tempStackLevel++;
	}
	removeTempScope() {
		this.clearCurrentTempScope();

		this.tempStackLevel--;
	}
	clearCurrentTempScope() {
		while (this.tempStackTop && this.tempStackTop.top.level > this.tempStackLevel) {
			this.popFromTempStack();
		}
	}
	hasValueOnCurrentLevel(): boolean {
		return this.hasTempValue() && this.tempStackTop.top.level == this.tempStackLevel;
	}
	isTempValueAlias(): boolean {
		return this.tempStackTop.top.getValue().dereference() != null;
	}
	passTempValue() {
		if (this.hasTempValue())
			this.tempStackTop.top.level = this.tempStackLevel;
		//else
		//	this.pushTempValue(TypeSystem.VoidClassObj.classInstance.defaultValue());
	}
	hasTempValue(): boolean {
		return this.tempStackTop != null;
	}

	// Manages flow of the program (like execution of return/break/continue statements)
	flowState: FlowState = FlowState.NormalFlow;

	// Iterating throuhg all memory field (mostly to be able to update their observers)
	foreachStackFields(func: (field: Memory.StackField) => any) {
		var scopes = this.stack.getScopes();
		while (scopes) {
			DataStructures.Stack.forAll(scopes.top.stack, func);
			scopes = scopes.tail;
		}
	}
	foreachTempStackFields(func: (field: Memory.TempStackField) => any) {
		var tempStack = this.tempStackTop;
		while (tempStack) {
			func(tempStack.top);
			tempStack = tempStack.tail;
		}
	}
	foreachHeapFields(func: (field: Memory.HeapField) => any) {
		var heap = this.heap;
		while (heap) {
			func(heap.top);
			heap = heap.tail;
		}
	}
	foreachMemoryFields(func: (field: Memory.MemoryField) => any) {
		this.foreachStackFields(func);
		this.foreachTempStackFields(func);
		this.foreachHeapFields(func);
	}
}