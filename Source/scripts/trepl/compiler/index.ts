import { Stack, StackMap } from '../data_structures'
import { NamedType, TypeField, TypeScope } from './Types'
import { IType, ICompiler, Context, INamedType, ITypeField } from './Interfaces'

export { IType, ICompiler }

export class Compiler implements ICompiler {
	private stack: StackMap<ITypeField, TypeScope> = new StackMap<ITypeField, TypeScope>();
	private closures: { [name: string]: IType }[] = []; // Used to monitor names that are being used inside scopes
	private namesOnStack: Stack<INamedType> = Stack.empty();
	private contexts: Stack<Context> = Stack.empty();
	private functionsExpections: Stack<IType> = Stack.empty();

	constructor() {
		this.addScope();
	}

	addElement(name: string, typ: IType) {
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
	getElement(name: string): ITypeField {
		var toGet = this.stack.getElement(name);

		if (!toGet)
			return null;

		for (var i = toGet.level + 1; i < this.closures.length; i++) {
			this.closures[i][toGet.name] = toGet.typ;
		}

		return toGet;
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

	addClosure() {
		this.closures.push({});
	}
	removeClosure(): { [name: string]: IType } {
		return this.closures.pop();
	}

	getNamesOnStack(): Stack<INamedType> {
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
			return Compiler.isInContextRec(context, contexts.tail);
		return false;
	}
	isInContext(context: Context): boolean {
		return Compiler.isInContextRec(context, this.contexts);
	}

	addFunctionExpection(expection: IType) {
		this.functionsExpections = Stack.push(expection, this.functionsExpections);
	}
	removeFunctionExpection() {
		this.functionsExpections = Stack.pop(this.functionsExpections);
	}
	getFunctionExpection(): IType {
		return this.functionsExpections.top;
	}
}