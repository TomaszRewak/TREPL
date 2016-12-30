module L {
    export class Any extends LogicElement {
        constructor() { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.returns = new TS.RValueOfType(TS.Int.typeInstance);

            return true;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.pushTempValue(TS.Int.classInstance);

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class Any extends Element {
        getJSONName() { return 'Any' }
        constructor() {
            super();
            this.initialize([
                [new C.Label('any')]
            ],
                ElementType.Type);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Any();
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Any().copyMetadata(this);
        }
    }
}