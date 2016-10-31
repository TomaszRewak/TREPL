module L {
    export class Void extends LogicElement {
        constructor() { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.returns = new TS.RValueOfType(TS.Void.typeInstance);

            return true;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.pushTempValue(TS.Void.classInstance);

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class Void extends Element {
        getJSONName() { return 'Void' }
        constructor() {
            super();
            this.initialize([
                [new C.Label('void')]
            ],
                ElementType.Type);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Void();
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Void().copyMetadata(this);
        }
    }
}