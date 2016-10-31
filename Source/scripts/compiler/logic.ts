module L {
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

    // UI observer
    export interface LogicElementObserver {
        getElement(): JQuery;
        error(message: string);
        executing();
        constructCode(): LogicElement;
        clearErrors();
        compiled(resultType: TS.StaticResult, visibleNames: DS.Stack<Compiler.NamedType>, context: TS.Type);
        getDescription(): string;
        getErrors(): string[];
        isDisplayingProgress(): boolean;
    }

    class EmptyLogicElementObserver implements EmptyLogicElementObserver {
        getElement() { return null; }
        error(message: string) { }
        executing() { }
        constructCode(): LogicElement { return null; }
        clearErrors() { }
        compiled(resultType: TS.StaticResult, visibleNames: DS.Stack<Compiler.NamedType>, context: TS.Type) { }
        getDescription(): string { return ''; }
        getErrors(): string[]{ return []; }
        isDisplayingProgress(): boolean { return false; }
    }

    // Represents logic interpretation of the element
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
        returns: TS.StaticResult = new TS.RValueOfType(new TS.ClassObjectType(TS.Void.typeInstance));
        returnsType(): TS.Type {
            return this.returns.varType;
        }
        // context - in case of for example path element, the inner context of this element is the type of element on the left side of the dot.
        innerContext: TS.Type;
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
            if (!element || element instanceof L.EmptyElement) {
                this.error('This field cannot be empty', element);
            }
        }
        errorIfTypeMismatch(expected: TS.StaticResult, found: TS.StaticResult, element: LogicElement) {
            if ((expected instanceof TS.LValueOfType) && !(found instanceof TS.LValueOfType)) {
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
        errorIfNotInstance(typ: TS.Type, element: LogicElement) {
            this.errorIfNot(typ instanceof TS.InstanceType, 'Expected type instance', element);
        }
        errorIfNotPrototype(typ: TS.Type, element: LogicElement) {
            this.errorIfNot(typ instanceof TS.PrototypeType, 'Expected type prototype', element);
        }

        defalutOperation: Operation = null;
        setAsInternalOperation(): LogicElement { 
            this.defalutOperation = Operation.internal(this);
            return this;
        }
    }

    export class IDeclaration extends LogicElement {
        constructor(public name: string) {
            super();
        }
        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.createTempValue(environment);
            yield* this.instantiate(environment);
            yield Operation.memory(this);
            return;
        }
        *instantiate(environment: Memory.Environment): IterableIterator<Operation> {
            throw 'abstract class member call';
        }
        *createTempValue(environment: Memory.Environment): IterableIterator<Operation> {
            throw 'abstract class member call';
        }
        expectsType: TS.StaticResult;
    }

    ////////////////////////////////// Usable logic elements //////////////////////////////////
}

var Operation = L.Operation;