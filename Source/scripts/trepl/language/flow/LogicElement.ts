import { LogicElementObserver, EmptyLogicElementObserver } from '../observers/LogicElementObserver'
import { StaticResult, LValue, RValue } from '../memory/type_system/StaticResult'
import { PrototypeType } from '../memory/type_system/Prototype'
import { InstanceType } from '../memory/type_system/Instance'
import { ReferenceType } from '../memory/type_system/Reference'
import { Type } from '../memory/type_system/Base'
import { Operation } from '../flow/Operation'

export class LogicElement {
	// Sets observer
	protected observer: LogicElementObserver = new EmptyLogicElementObserver();
	setObserver(observer: LogicElementObserver) {
		this.observer = observer;
		this.observer.clearErrors();
	}
	getObserver(): LogicElementObserver {
		return this.observer;
	}
	// Makes static evaluation and returs the result of it (called be parent)
	compile(environment: Compiler.TypeEnvironment): boolean {
		var compilationResult = this._compile(environment);

		this.observer.compiled(
			compilationResult ? this.returns : null,
			environment.getNamesOnStack(),
			this.innerContext);

		return compilationResult;
	}
	protected _compile(environment: Compiler.TypeEnvironment): boolean {
		return false;
	}
	// Compilec contained block of instructions. Do not compile unreachable elements
	// Returns value indicating if given block breaks a loop, or returns a value
	compileBlock(environment: Compiler.TypeEnvironment, elements: LogicElement[]): Compiler.FlowState {
		var flowState = Compiler.FlowState.Normal;

		var i = 0;
		for (; i < elements.length; i++) {
			var element = elements[i];
			this.cs = element.compile(environment) && this.cs;

			if (element.flowState != Compiler.FlowState.Normal) {
				flowState = element.flowState;
				break;
			}
		}
		for (i++; i < elements.length; i++) {
			var element = elements[i];
			if (element instanceof EmptyElement)
				continue;
			this.error('This operation is not reachable', element);
		}
		return flowState;
	}
	flowState: Compiler.FlowState = Compiler.FlowState.Normal;
	// static evaluation product
	returns: StaticResult = new RValue(new TS.ClassObjectType(TS.Void.typeInstance));
	returnsType(): Type {
		return this.returns.varType;
	}
	// context - in case of for example path element, the inner context of this element is the type of element on the left side of the dot.
	innerContext: Type;
	// Logic components for tags
	logicComponents: { [tag: string]: LogicElement[] } = {};
	// Called during code execution by the parent element
	*run(environment: Memory.Environment): IterableIterator<Operation> {
		environment.addTempStackScope();

		var operations = this.execute(environment);
		var next = operations.next();
		while (!next.done) {
			var value = next.value;

			if (this.defalutOperation && value.element == this)
				yield this.defalutOperation;
			else
				yield value;

			next = operations.next();
		}

		if (!environment.hasValueOnCurrentLevel())
			environment.pushTempValue(TS.Void.classInstance.defaultValue());

		environment.removeTempScope();

		return;
	}
	// Executes code inside
	protected *execute(environment: Memory.Environment): IterableIterator<Operation> {
		return;
	}

	protected static *executeBlock(environment: Memory.Environment, list: LogicElement[]) {
		for (var i = 0; i < list.length; i++) {
			yield* list[i].run(environment);

			if (environment.flowState == Memory.FlowState.Return) {
				environment.passTempValue();
				return;
			}
			else if (environment.flowState != Memory.FlowState.NormalFlow)
				return;
			else
				environment.clearCurrentTempScope();
		}
	}
	// Compilation status
	cs = true;
	// message - message describing this error
	// element - element that has to be highlighted as containing an error
	error(message: string, element: LogicElement = this) {
		this.cs = false;
		element.cs = false;
		element.observer.error(message);
	}
	errorIf(condition: boolean, message: string, element: LogicElement = this) {
		if (condition)
			this.error(message, element);
	}
	errorIfNot(condition: boolean, message: string, element: LogicElement = this) {
		this.errorIf(!condition, message, element);
	}

	errorIfEmpty(element: LogicElement) {
		if (!element || element instanceof EmptyElement) {
			this.error('This field cannot be empty', element);
		}
	}
	errorIfTypeMismatch(expected: StaticResult, found: StaticResult, element: LogicElement) {
		if ((expected instanceof LValue) && !(found instanceof LValue)) {
			this.error(
				'Type mismatch: expected L-Value of type"' + expected.varType.getTypeName() + '", but found R-Value of type"' + found.varType.getTypeName() + '"',
				element);
		}
		else {
			if (!found.varType.assignalbeTo(expected.varType)) {
				this.error(
					'Type mismatch: expected "' + expected.varType.getTypeName() + '", but found "' + found.varType.getTypeName() + '"',
					element);
			}
		}
	}
	errorIfNotInstance(typ: Type, element: LogicElement) {
		this.errorIfNot(typ instanceof InstanceType, 'Expected a type instance', element);
	}
	errorIfNotPrototype(typ: Type, element: LogicElement) {
		this.errorIfNot(typ instanceof PrototypeType, 'Expected a type prototype', element);
	}
	errorIfNotReference(typ: Type, element: LogicElement) {
		this.errorIfNot(typ instanceof ReferenceType, 'Expected a reference', element);
	}

	defalutOperation: Operation = null;
	setAsInternalOperation(): LogicElement {
		this.defalutOperation = Operation.internal(this);
		return this;
	}
}

export class EmptyElement extends LogicElement {
	_compile(environment: Compiler.TypeEnvironment): boolean {
		return true;
	}

	*execute(environment: Memory.Environment): IterableIterator<Operation> {
		return;
	}
}