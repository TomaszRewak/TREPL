module L {
    export class False extends LogicElement {
        constructor() { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.returns = new TS.RValueOfType(new TS.ClassObjectType(TS.Boolean.typeInstance));

            return true;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.pushTempValue(TS.Boolean.classInstance.getObjectOfValue(false));

            yield Operation.tempMemory(this);

            return;
        }
    }
} 

module E {
    export class False extends Element {
        getJSONName() { return 'False' }
        c_name: C.Label;
        constructor() {
            super();
            this.c_name = new C.Label('false');
            this.initialize([
                [this.c_name]
            ], ElementType.Value);
        }
        constructCode(): L.LogicElement {
            var logic = new L.False();
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new False().copyMetadata(this);
        }
    }
}