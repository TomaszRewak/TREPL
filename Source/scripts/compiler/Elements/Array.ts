module L {
    export class Array extends LogicElement {
        constructor(
            public log_type: LogicElement,
            public log_length: string
            ) { super(); }

        length: number;
        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_type);
            if (!this.cs) return false;

            this.cs = this.log_type.compile(environment) && this.cs;
            if (!this.cs) return false;

            this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
            if (!this.cs) return false;

            this.length = parseInt(this.log_length);
            this.errorIf(isNaN(this.length), 'provided length is not a number');
            if (!this.cs) return false;
            this.errorIf(this.length <= 0, 'length must be greater then zero');
            if (!this.cs) return false;

            var prototypeType = <TS.PrototypeType> this.log_type.returnsType();
            this.returns = new TS.RValueOfType(new TS.ArrayOfLengthClassType(prototypeType, this.length));

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_type.run(environment);

            var tempValue = <TS.Prototype> environment.popTempValue().getValue();
            environment.pushTempValue(new TS.ArrayClass(tempValue, this.length));

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class Array extends Element {
        getJSONName() { return 'Array' }
        c_type: C.DropField;
        c_length: C.TextField;
        constructor(typ: Element = null, value: string = '4') {
            super();
            this.c_type = new C.DropField(this, typ)
            this.c_length = new C.TextField(this, value);
            this.initialize([
                [
                    this.c_type,
                    new C.Label('['),
                    this.c_length,
                    new C.Label(']'),
                ]
            ],
                ElementType.Type);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Array(
                this.c_type.constructCode(),
                this.c_length.getRawData()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Array(
                this.c_type.getContentCopy(),
                this.c_length.getRawData()
                ).copyMetadata(this);
        }
    }
} 