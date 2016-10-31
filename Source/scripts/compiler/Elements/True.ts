module L {
    export class True extends LogicElement {
        constructor() { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.returns = new TS.RValueOfType(new TS.ClassObjectType(TS.Boolean.typeInstance));

            return true;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.pushTempValue(TS.Boolean.classInstance.getObjectOfValue(true));

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class True extends Element {
        getJSONName() { return 'True' }
        c_name: C.Label;
        constructor() {
            super();
            this.c_name = new C.Label('true');
            this.initialize([
                [this.c_name]
            ], ElementType.Value);
        }
        constructCode(): L.LogicElement {
            var logic = new L.True();
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new True().copyMetadata(this);
        }
    }
} 