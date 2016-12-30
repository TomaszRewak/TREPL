module L {
    export class Random extends LogicElement {
        constructor(
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment) {
            this.returns = new TS.RValueOfType(new TS.ClassObjectType(TS.Int.typeInstance));
            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.pushTempValue(TS.Int.classInstance.getObjectOfValue(Math.floor(Math.random() * 100)));

            return;
        }
    }
}

module E {
    export class Random extends Element {
        getJSONName() { return 'Random' }
        constructor() {
            super();
            this.initialize([
                [new C.Label('random()')]
            ], ElementType.Value);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Random(
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Random().copyMetadata(this);
        }
    }
}