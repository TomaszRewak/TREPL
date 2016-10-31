module DS { // Data structures
    export interface INamed {
        name: string;
    }
    // Simply a stack
    export class Stack<T> {
        tail: Stack<T> = null;
        top: T;

        static empty() {
            return null;
        }
        static push<T>(element: T, stack: Stack<T>): Stack<T> {
            if (!stack)
                stack = null;

            var newNode = new Stack<T>();
            newNode.top = element;
            newNode.tail = stack;

            return newNode;
        }
        static pop<T>(stack: Stack<T>): Stack<T> {
            return stack.tail;
        }
        static top<T>(stack: Stack<T>): T {
            if (!stack)
                throw 'Empty stack exception'

            return stack.top;
        }
        static remove<T>(element: T, stack: Stack<T>): Stack<T> {
            if (!stack)
                return Stack.empty();

            if (stack.top == element)
                return stack.tail;

            stack.tail = Stack.remove(element, stack);
            return stack;
        }
        static forAll<T>(stack: Stack<T>, operation: (value: T) => void) {
            if (stack) {
                operation(stack.top);
                Stack.forAll(stack.tail, operation);
            }
        }
    }
    // Scope of names in programm
    export class Scope<T> {
        stack: Stack<T> = Stack.empty();
        constructor() {
        }
    }
    // Stack of scopes (to be easly removed)
    export class StackMap<T extends INamed, S extends Scope<any>> {
        // For all names there is a stack on top of witch is currently associated value
        private map: { [id: string]: Stack<T> } = {}
        // Stack of all scopes
        private scopes: Stack<S> = null;
        addScope(scope: S) {
            this.scopes = Stack.push(scope, this.scopes);
        }
        removeScope(): S {
            if (!this.scopes)
                throw 'No scope to remove';

            var oldScope = this.scopes.top;
            this.scopes = this.scopes.tail;

            var scopeToRemove = oldScope.stack;
            while (scopeToRemove) {
                var name = scopeToRemove.top.name;
                this.map[name] = this.map[name].tail;

                scopeToRemove = scopeToRemove.tail;
            }

            return oldScope;
        }
        // Adds element to the current scope
        addElement(value: T) {
            this.map[value.name] = Stack.push(value, this.map[value.name]);
            this.scopes.top.stack = Stack.push(value, this.scopes.top.stack);
        }
        // Gets top scope
        getScope(): S {
            return this.scopes.top;
        }
        // Gets all scopes
        getScopes(): Stack<S> {
            return this.scopes;
        }
        // Get element
        getElement(name: string) {
            if (this.map[name])
                return this.map[name].top;
            else return null;
        }
        // Has element
        hasElement(name: string): boolean {
            return !!this.map[name];
        }
        // Has scope
        hasScope(): boolean {
            return !!this.scopes;
        }
    }
}

module Memory {
    import MO = MemoryObservers;

    // Enacapsulates communication with stack
    export class Environment {
        private stack: DS.StackMap<StackField, StackScope> = new DS.StackMap<StackField, StackScope>();
        observer = MO.getEnvironmentObserver();

        constructor() {
            this.addScope('Environment');
        }
        addValueToStack(val: TS.Obj, name: string) {
            if (this.stack.hasElement(name)) {
                this.stack.getElement(name).observer.visible(false);
            }

            var field = new StackField(name);
            field.setValue(val);
            this.stack.addElement(field);
            this.observer.addFieldToStack(field);
        }
        addAliasToStack(referenced: MemoryField, name: string) {
            var value = <TS.Instance> referenced.getValue();
            this.addValueToStack(new TS.Alias(new TS.ReferenceClass(value.prototype), referenced), name);
        }
        getFromStack(name: string): MemoryField {
            var field = this.stack.getElement(name);

            if (field.getValue() instanceof TS.Alias)
                return (<TS.Alias> field.getValue()).reference;
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
        private heap: DS.Stack<HeapField> = null;
        addToHeap(val: TS.Obj): HeapField {
            var field = new HeapField();
            field.setValue(val);
            // TODO?
            this.heap = DS.Stack.push(field, this.heap);
            this.observer.addFieldToHeap(field);

            return field;
        }

        // Manages scopes for temporery values (like the resault of applying math operatos)
        private tempStackLevel: number = 0;
        private tempStackTop: DS.Stack<TempStackField> = null;
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
        pushTempValue(value: TS.Obj) {
            var newStackField = new TempStackField(this.tempStackLevel);
            newStackField.setValue(value);
            this.tempStackTop = DS.Stack.push(newStackField, this.tempStackTop);
            this.observer.addFieldToTempStack(newStackField);
        }
        pushTempAlias(field: MemoryField) {
            var value = <TS.Instance> field.getValue();
            this.pushTempValue(new TS.Alias(new TS.ReferenceClass(value.prototype), field));
        }
        popTempValue(): MemoryField {
            var field = DS.Stack.top(this.tempStackTop);
            this.tempStackTop = DS.Stack.pop(this.tempStackTop);
            this.observer.removeFieldFromTempStack(field);

            if (field.getValue() instanceof TS.Alias)
                return (<TS.Alias> field.getValue()).reference;
            else return field;
        }
        isTempValueAlias(): boolean {
            return this.tempStackTop.top.getValue() instanceof TS.Alias;
        }
        passTempValue() {
            if (this.hasTempValue())
                this.tempStackTop.top.level = this.tempStackLevel;
            else
                this.pushTempValue(TS.Void.classInstance.defaultValue());
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
                DS.Stack.forAll(scopes.top.stack, func);
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
    export enum FlowState {
        NormalFlow,
        Return,
        Break,
        Continue,
    }
    export class MemoryField {
        protected value: TS.Obj;
        private references: DS.Stack<TS.Reference> = DS.Stack.empty();

        observer: MO.MemoryFieldObserver;

        constructor() {}

        setValue(val: TS.Obj): MemoryField {
            this.value = val;
            this.observer.setFieldValue(val);
            return this;
        }

        getValue(): TS.Obj {
            return this.value;
        }

        referencedBy(ref: TS.Reference) {
            this.references = DS.Stack.push(ref, this.references);
        }

        unreferencedBy(ref: TS.Reference) {
            this.references = DS.Stack.remove(ref, this.references);
        }

        getReferences(): DS.Stack<TS.Reference> {
            return this.references;
        }
    }

    export class StackField extends MemoryField implements DS.INamed {
        observer = new MO.StackFieldObserver(this);
        constructor(public name: string) {
            super();
        } 
    }

    export class TempStackField extends MemoryField {
        observer = new MO.TempStackFieldObserver(this);
        constructor(public level: number) {
            super();
        }
    }
    export class AliasTempStackField extends TempStackField {
        observer = new MO.TempStackFieldObserver(this);
        constructor(public level: number) {
            super(level);
        }
    }

    export class HeapField extends MemoryField {
        constructor() {
        super();
        }
        observer = new MO.HeapFieldObserver(this);
    }

    export class StackScope extends DS.Scope<StackField> {
        observer = new MO.ScopeObserver(this);
        constructor(public name: string) { super(); }
    }
}
module Compiler {
    // Environment used to check for type correctness and find variables to be enclosed
    export class TypeEnvironment {
        private stack: DS.StackMap<TypeField, TypeScope> = new DS.StackMap<TypeField, TypeScope>();
        private closures: { [name: string]: TS.Type }[] = []; // Used to monitor names that are being used inside scopes
        private namesOnStack: DS.Stack<NamedType> = DS.Stack.empty();
        private contexts: DS.Stack<Context> = DS.Stack.empty();
        private functionsExpections: DS.Stack<TS.Type> = DS.Stack.empty();

        constructor() {
            this.addScope();
        }

        addClosure() {
            this.closures.push({});
        }
        removeClosure(): { [name: string]: TS.Type } {
            return this.closures.pop();
        }

        addElement(name: string, typ: TS.Type) {
            var newElement =
                new TypeField(
                    name,
                    typ,
                    this.closures.length - 1);
            this.stack.addElement(newElement);
            this.namesOnStack = DS.Stack.push(
                new NamedType(name, typ),
                this.namesOnStack);
        }
        addScope() {
            var scope = new TypeScope();
            this.stack.addScope(scope);
        }
        removeScope() {
            var removedScope = this.stack.removeScope();

            var removedScopeStack = removedScope.stack;
            while (removedScopeStack) {
                this.namesOnStack = this.namesOnStack.tail;
                removedScopeStack = removedScopeStack.tail;
            }
        }

        getElement(name: string): TypeField {
            var toGet = this.stack.getElement(name);

            if (!toGet)
                return null;
            
            for (var i = toGet.level + 1; i < this.closures.length; i++) {
                this.closures[i][toGet.name] = toGet.typ;
            }

            return toGet;
        }

        getNamesOnStack(): DS.Stack<NamedType> {
            return this.namesOnStack;
        }

        addContext(context: Context) {
            this.contexts = DS.Stack.push(context, this.contexts);
        }
        removeContext() {
            this.contexts = DS.Stack.pop(this.contexts);
        }
        private static isInContextRec(context: Context, contexts: DS.Stack<Context>): boolean {
            if (!contexts)
                return false;

            var topContext = contexts.top;

            if (context == Context.Loop && topContext == Context.Loop)
                return true;
            if (context == Context.Function && topContext == Context.Function)
                return true;
            if (context == Context.Function)
                return TypeEnvironment.isInContextRec(context, contexts.tail);
            return false;
        }
        isInContext(context: Context): boolean {
            return TypeEnvironment.isInContextRec(context, this.contexts);
        }

        addFunctionExpection(expection: TS.Type) {
            this.functionsExpections = DS.Stack.push(expection, this.functionsExpections);
        }
        removeFunctionExpection() {
            this.functionsExpections = DS.Stack.pop(this.functionsExpections);
        }
        getFunctionExpection(): TS.Type {
            return this.functionsExpections.top;
        }
    }
    export enum FlowState {
        Normal = 0,
        Break = 1,
        Return = 2
    }
    export enum Context {
        Function,
        Loop
    }
    class TypeScope extends DS.Scope<TypeField> { }
    export class NamedType implements DS.INamed {
        constructor(public name: string, public typ: TS.Type) { }
    }
    class TypeField extends NamedType {
        constructor(name: string, typ: TS.Type, public level: number) {
            super(name, typ);
        }
    }
} 