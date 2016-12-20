module L {
    export class String extends LogicElement {
        constructor() { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.returns = new TS.RValueOfType(TS.String.typeInstance);

            return true;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.pushTempValue(TS.String.classInstance);

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class String extends Element {
        getJSONName() { return 'String' }
        constructor() {
            super();
            this.initialize([
                [new C.Label('string')]
            ], ElementType.Type);
        }
        constructCode(): L.LogicElement {
            var logic = new L.String();
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new String().copyMetadata(this);
        }
    }
} 