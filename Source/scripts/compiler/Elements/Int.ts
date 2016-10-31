module L {
    export class Int extends LogicElement {
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
    export class Int extends Element {
        getJSONName() { return 'Int' }
        constructor() {
            super();
            this.initialize([
                [new C.Label('number')]
            ], ElementType.Type);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Int();
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Int().copyMetadata(this);
        }
    }
} 