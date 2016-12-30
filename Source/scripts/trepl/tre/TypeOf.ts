module L {
    export class TypeOf extends LogicElement {
        constructor(
            public log_type: LogicElement
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_type);
            this.cs = this.log_type.compile(environment) && this.cs;
            if (!this.cs) return false;

            this.errorIfNotInstance(this.log_type.returnsType(), this.log_type);
            if (!this.cs) return false;

            var prototype = (<TS.InstanceType> this.log_type.returns.varType).prototypeType;

            this.returns = new TS.RValueOfType(prototype);

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_type.run(environment);

            var prototype = (<TS.Instance> environment.popTempValue().getValue()).prototype;

            environment.pushTempValue(prototype);

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class TypeOf extends Element {
        getJSONName() { return 'TypeOf' }
        c_object: C.DropField
        constructor(
            object: E.Element = null) {
            super();
            this.c_object = new C.DropField(this, object)
            this.initialize([
                [
                    new C.Label('type of'),
                    this.c_object,
                ]
            ], ElementType.Type);
        }
        constructCode(): L.LogicElement {
            var logic = new L.TypeOf(
                this.c_object.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new TypeOf(
                this.c_object.getContentCopy()).copyMetadata(this);
        }
    }
} 