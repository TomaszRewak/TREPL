import { Stack, StackMap } from '../data_structures'
import { MemoryField, StackField, StackScope, HeapField, TempStackField } from './memory'
import { IEnvironment, IMemoryField, IValue, FlowState } from './interfaces'

export { IEnvironment, IValue, IMemoryField, FlowState, MemoryField }

export class Environment implements IEnvironment {
	public flowState: FlowState = FlowState.NormalFlow;

	constructor() {
		this.addScope('Environment');
	}

	private stack = new StackMap<StackField, StackScope>();
	addOnStack(value: IValue, name: string) : IMemoryField {
		var field = new StackField(name);

		field.setValue(value);
		this.stack.addElement(field);

		return field;
	}
	getFromStack(name: string): IMemoryField {
		return this.stack.getElement(name);
	}

	addScope(name: string) {
		var scope = new StackScope(name);
		this.stack.addScope(scope);
		this.observer.emit('new stack scope', scope);
	}
	removeScope() {
		var removedScope = this.stack.removeScope();

		var stack = removedScope.stack;
		while (stack) {
			var field = stack.top;
			this.observer.emit('remove stack field', field);
			if (this.stack.hasElement(field.name))
				this.stack.getElement(field.name).observer.visible(true);
			stack = stack.tail;
		}

		this.observer.emit('remove stack scope', removedScope);
		if (this.stack.hasScope())
			this.stack.getScope().observer.visible(true);
	}

	private heap: Stack<HeapField> = null;
	addToHeap(val: IValue): HeapField {
		var field = new HeapField();
		field.setValue(val);
		this.heap = Stack.push(field, this.heap);
		this.observer.emit('new heap field', field);

		return field;
	}
	removeFromHeap(field: IMemoryField) {
		// TODO
	}

	private tempStackLevel: number = 0;
	private tempStackTop: Stack<TempStackField> = null;
	addOnTempStack(value: IValue) {
		var newStackField = new TempStackField(this.tempStackLevel);
		newStackField.setValue(value);
		this.tempStackTop = Stack.push(newStackField, this.tempStackTop);
		this.observer.emit('new temp stack field', newStackField);
	}
	popFromTempStack(): IMemoryField {
		var field = Stack.top(this.tempStackTop);
		this.tempStackTop = Stack.pop(this.tempStackTop);
		this.observer.emit('remove temp stack field', field);
		
		return field;
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
	passTempValue() {
		if (this.hasTempValue())
			this.tempStackTop.top.level = this.tempStackLevel;
		//else
		//	this.pushTempValue(TypeSystem.VoidClassObj.classInstance.defaultValue());
	}
	hasTempValue(): boolean {
		return this.tempStackTop != null;
	}
}