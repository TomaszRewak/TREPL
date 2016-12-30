module L {
    export class Bool extends LogicElement {
        constructor() { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.returns = new TS.RValueOfType(TS.Boolean.typeInstance);

            return true;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.pushTempValue(TS.Boolean.classInstance);

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class Bool extends Element {
        getJSONName() { return 'Bool' }
        constructor() {
            super();
            this.initialize([
                [new C.Label('bool')]
            ], ElementType.Type);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Bool();
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Bool().copyMetadata(this);
        }
    }
} 