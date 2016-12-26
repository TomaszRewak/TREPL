import { Stack } from '../memory/data_structures/Stack'
import { StackMap } from '../memory/data_structures/StackMap'
import { StackField } from '../memory/memory_fields/StackField'
import { StackScope } from '../memory/memory_fields/StackScope'
import { MemoryField } from '../memory/memory_fields/MemoryField'
import { HeapField } from '../memory/memory_fields/HeapField'
import { TempStackField } from '../memory/memory_fields/TempStackField'
import { Obj } from '../memory/type_system/Base'
import { InstanceObj } from '../memory/type_system/Instance'
import { Alias, ReferenceClassObj } from '../memory/type_system/Reference'
import { VoidClassObj } from '../memory/type_system/BaseTypes'

export enum FlowState {
	NormalFlow,
	Return,
	Break,
	Continue,
}

export class Environment {
	private stack: StackMap<StackField, StackScope> = new StackMap<StackField, StackScope>();
	observer = MO.getEnvironmentObserver();

	constructor() {
		this.addScope('Environment');
	}
	addValueToStack(val: Obj, name: string) {
		if (this.stack.hasElement(name)) {
			this.stack.getElement(name).observer.visible(false);
		}

		var field = new StackField(name);
		field.setValue(val);
		this.stack.addElement(field);
		this.observer.addFieldToStack(field);
	}
	addAliasToStack(referenced: MemoryField, name: string) {
		var value = <InstanceObj>referenced.getValue();
		this.addValueToStack(new Alias(new ReferenceClassObj(value.prototype), referenced), name);
	}
	getFromStack(name: string): MemoryField {
		var field = this.stack.getElement(name);

		if (field.getValue() instanceof Alias)
			return (<Alias>field.getValue()).reference;
		else return field;
	}
	addScope(name: string) {
		if (this.stack.hasScope())
			this.stack.getScope().observer.visible(false);
		var scope = new StackScope(name);
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
	private heap: Stack<HeapField> = null;
	addToHeap(val: Obj): HeapField {
		var field = new HeapField();
		field.setValue(val);
		// TODO?
		this.heap = Stack.push(field, this.heap);
		this.observer.addFieldToHeap(field);

		return field;
	}

	// Manages scopes for temporery values (like the resault of applying math operatos)
	private tempStackLevel: number = 0;
	private tempStackTop: Stack<TempStackField> = null;
	addTempStackScope() {
		this.tempStackLevel++;
	}
	removeTempScope() {
		this.clearCurrentTempScope();

		this.tempStackLevel--;
	}
	clearCurrentTempScope() {
		while (this.tempStackTop && this.tempStackTop.top.level > this.tempStackLevel) {
			this.popTempValue();
		}
	}
	hasValueOnCurrentLevel(): boolean {
		return this.hasTempValue() && this.tempStackTop.top.level == this.tempStackLevel;
	}
	pushTempValue(value: Obj) {
		var newStackField = new TempStackField(this.tempStackLevel);
		newStackField.setValue(value);
		this.tempStackTop = Stack.push(newStackField, this.tempStackTop);
		this.observer.addFieldToTempStack(newStackField);
	}
	pushTempAlias(field: MemoryField) {
		var value = <InstanceObj>field.getValue();
		this.pushTempValue(new Alias(new ReferenceClassObj(value.prototype), field));
	}
	popTempValue(): MemoryField {
		var field = Stack.top(this.tempStackTop);
		this.tempStackTop = Stack.pop(this.tempStackTop);
		this.observer.removeFieldFromTempStack(field);

		if (field.getValue() instanceof Alias)
			return (<Alias>field.getValue()).reference;
		else return field;
	}
	isTempValueAlias(): boolean {
		return this.tempStackTop.top.getValue() instanceof Alias;
	}
	passTempValue() {
		if (this.hasTempValue())
			this.tempStackTop.top.level = this.tempStackLevel;
		else
			this.pushTempValue(VoidClassObj.classInstance.defaultValue());
	}
	hasTempValue(): boolean {
		return this.tempStackTop != null;
	}

	// Manages flow of the program (like execution of return/break/continue statements)
	flowState: FlowState = FlowState.NormalFlow;

	// Iterating throuhg all memory field (mostly to be able to update their observers)
	foreachStackFields(func: (field: StackField) => any) {
		var scopes = this.stack.getScopes();
		while (scopes) {
			Stack.forAll(scopes.top.stack, func);
			scopes = scopes.tail;
		}
	}
	foreachTempStackFields(func: (field: TempStackField) => any) {
		var tempStack = this.tempStackTop;
		while (tempStack) {
			func(tempStack.top);
			tempStack = tempStack.tail;
		}
	}
	foreachHeapFields(func: (field: HeapField) => any) {
		var heap = this.heap;
		while (heap) {
			func(heap.top);
			heap = heap.tail;
		}
	}
	foreachMemoryFields(func: (field: MemoryField) => any) {
		this.foreachStackFields(func);
		this.foreachTempStackFields(func);
		this.foreachHeapFields(func);
	}
}