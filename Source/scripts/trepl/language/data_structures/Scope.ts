import {Stack} from './Stack'

export class Scope<T> {
	stack: Stack<T> = Stack.empty();
	constructor() {
	}
}