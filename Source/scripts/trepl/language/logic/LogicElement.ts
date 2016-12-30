import * as TypeSystem from '../type_system'
import * as Observers from '../observers'
import * as Flow from '../flow'
import * as Environment from '../environment'
import * as Compiler from '../compiler'

export abstract class LogicElement implements Flow.Executable {
	// Sets observer
	protected observer: Observers.LogicElementObserver = new Observers.EmptyLogicElementObserver();
	setObserver(observer: Observers.LogicElementObserver) {
		this.observer = observer;
		this.observer.clearErrors();
	}
	getObserver(): Observers.LogicElementObserver {
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
	returns: TypeSystem.StaticResult = new TypeSystem.RValue(new TypeSystem.ClassInstanceType(TypeSystem.VoidClassObj.typeInstance));
	returnsType(): TypeSystem.Type {
		return this.returns.varType;
	}
	// context - in case of for example path element, the inner context of this element is the type of element on the left side of the dot.
	innerContext: TypeSystem.Type;
	// Logic components for tags
	logicComponents: { [tag: string]: LogicElement[] } = {};
	// Called during code execution by the parent element
	*run(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		environment.addTempScope();

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
			environment.addOnTempStack(TypeSystem.VoidClassObj.classInstance.defaultValue());

		environment.removeTempScope();

		return;
	}
	// Executes code inside
	abstract execute(environment: Environment.Environment): IterableIterator<Flow.Operation>;

	protected static *executeBlock(environment: Environment.Environment, list: LogicElement[]) {
		for (var i = 0; i < list.length; i++) {
			yield* list[i].run(environment);

			if (environment.flowState == Environment.FlowState.Return) {
				environment.passTempValue();
				return;
			}
			else if (environment.flowState != Environment.FlowState.NormalFlow)
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
	errorIfTypeMismatch(expected: TypeSystem.StaticResult, found: TypeSystem.StaticResult, element: LogicElement) {
		if ((expected instanceof TypeSystem.LValue) && !(found instanceof TypeSystem.LValue)) {
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
	errorIfNotInstance(typ: TypeSystem.Type, element: LogicElement) {
		this.errorIfNot(typ instanceof TypeSystem.InstanceType, 'Expected a type instance', element);
	}
	errorIfNotPrototype(typ: TypeSystem.Type, element: LogicElement) {
		this.errorIfNot(typ instanceof TypeSystem.PrototypeType, 'Expected a type prototype', element);
	}
	errorIfNotReference(typ: TypeSystem.Type, element: LogicElement) {
		this.errorIfNot(typ instanceof TypeSystem.ReferenceType, 'Expected a reference', element);
	}

	defalutOperation: Flow.Operation = null;
	setAsInternalOperation(): LogicElement {
		this.defalutOperation = Flow.Operation.internal(this);
		return this;
	}
}

export class EmptyElement extends LogicElement {
	_compile(environment: Compiler.TypeEnvironment): boolean {
		return true;
	}

	*execute(environment: Environment.Environment): IterableIterator<Flow.Operation> {
		return;
	}
}