import { Stack } from '../memory/data_structures/Stack'
import { StackMap } from '../memory/data_structures/StackMap'
import { TypeField } from './TypeField'
import { TypeScope } from './TypeScope'
import { NamedType } from './NamedType'
import { Type } from '../memory/type_system/Base'

export enum FlowState {
	Normal = 0,
	Break = 1,
	Return = 2
}
export enum Context {
	Function,
	Loop
}

export class TypeEnvironment {
	private stack: StackMap<TypeField, TypeScope> = new StackMap<TypeField, TypeScope>();
	private closures: { [name: string]: Type }[] = []; // Used to monitor names that are being used inside scopes
	private namesOnStack: Stack<NamedType> = Stack.empty();
	private contexts: Stack<Context> = Stack.empty();
	private functionsExpections: Stack<Type> = Stack.empty();

	constructor() {
		this.addScope();
	}

	addClosure() {
		this.closures.push({});
	}
	removeClosure(): { [name: string]: Type } {
		return this.closures.pop();
	}

	addElement(name: string, typ: Type) {
		var newElement =
			new TypeField(
				name,
				typ,
				this.closures.length - 1);
		this.stack.addElement(newElement);
		this.namesOnStack = Stack.push(
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

	getNamesOnStack(): Stack<NamedType> {
		return this.namesOnStack;
	}

	addContext(context: Context) {
		this.contexts = Stack.push(context, this.contexts);
	}
	removeContext() {
		this.contexts = Stack.pop(this.contexts);
	}
	private static isInContextRec(context: Context, contexts: Stack<Context>): boolean {
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

	addFunctionExpection(expection: Type) {
		this.functionsExpections = Stack.push(expection, this.functionsExpections);
	}
	removeFunctionExpection() {
		this.functionsExpections = Stack.pop(this.functionsExpections);
	}
	getFunctionExpection(): Type {
		return this.functionsExpections.top;
	}
}