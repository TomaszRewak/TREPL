module L {
    export class Break extends LogicElement {
        constructor() { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfNot(environment.isInContext(Compiler.Context.Loop), 'You can use "break" keyword only inside a loop');
            this.flowState = Compiler.FlowState.Break;

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.flowState = Memory.FlowState.Break;

            yield Operation.flow(this);

            return;
        }
    }
}

module E {
    export class Break extends Element {
        getJSONName() { return 'Break' }
        constructor(mesage: E.Element = null) {
            super();
            this.initialize([  // TODO: Zmienić
                [
                    new C.Label('break'),
                ]
            ], ElementType.Flow);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Break();
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Break().copyMetadata(this);
        }
    }
} 