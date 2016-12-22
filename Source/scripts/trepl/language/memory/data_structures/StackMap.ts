import {Scope} from './Scope'
import {INamed} from './INamed'
import {Stack} from './Stack'

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