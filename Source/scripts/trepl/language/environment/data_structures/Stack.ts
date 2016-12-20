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