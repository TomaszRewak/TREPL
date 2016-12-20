module L {
    export class Continue extends LogicElement {
        constructor() { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfNot(environment.isInContext(Compiler.Context.Loop), 'You can use "continue" keyword only inside a loop');
            this.flowState = Compiler.FlowState.Break;

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.flowState = Memory.FlowState.Continue;

            yield Operation.flow(this);

            return;
        }
    }
}

module E {
    export class Continue extends Element {
        getJSONName() { return 'Continue' }
        constructor(mesage: E.Element = null) {
            super();
            this.initialize([  // TODO: Zmienić
                [
                    new C.Label('continue'),
                ]
            ], ElementType.Flow);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Continue();
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Continue().copyMetadata(this);
        }
    }
} 