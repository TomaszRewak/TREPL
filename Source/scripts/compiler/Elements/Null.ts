module L {
    export class Null extends LogicElement {
        constructor() { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.returns = new TS.RValueOfType(new TS.ReferenceType(new TS.ReferenceClassType(TS.Void.typeInstance)));

            return true;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.pushTempValue(new TS.Reference(new TS.ReferenceClass(TS.Void.classInstance), null));

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class Null extends Element {
        getJSONName() { return 'Null' }
        c_name: C.Label;
        constructor() {
            super();
            this.c_name = new C.Label('null');
            this.initialize([
                [this.c_name]
            ], ElementType.Value);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Null();
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Null().copyMetadata(this);
        }
    }
} 