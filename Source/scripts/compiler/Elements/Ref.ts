module L {
    export class Ref extends LogicElement {
        constructor(
            public log_type: LogicElement
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {

            this.cs = this.log_type.compile(environment) && this.cs;
            if (!this.cs) return false;

            this.errorIfEmpty(this.log_type);
            if (!this.cs) return false;

            this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
            if (!this.cs) return false;

            var prototypeType = <TS.PrototypeType> this.log_type.returnsType();

            this.returns = new TS.RValueOfType(new TS.ReferenceClassType(prototypeType));

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_type.run(environment);

            var tempValue = <TS.Prototype> environment.popTempValue().getValue();
            environment.pushTempValue(new TS.ReferenceClass(tempValue));

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class Ref extends Element {
        getJSONName() { return 'Ref' }
        c_type: C.DropField
        constructor(typ: Element = null) {
            super();
            this.c_type = new C.DropField(this, typ)
            this.initialize([
                [
                    this.c_type,
                    new C.Label('ref'),
                ]
            ],
                ElementType.Type);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Ref(
                this.c_type.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Ref(
                this.c_type.getContentCopy()
                ).copyMetadata(this);
        }
    }
} 