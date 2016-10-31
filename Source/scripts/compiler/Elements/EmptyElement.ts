module L {
    export class EmptyElement extends LogicElement {
        _compile(environment: Compiler.TypeEnvironment): boolean {
            return true;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            return;
        }
    }
} 