module L {
    export class ValueOf extends LogicElement {
        constructor(
            public log_value: LogicElement
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_value);
            this.cs = this.log_value.compile(environment) && this.cs;
            if (!this.cs) return false;

            this.errorIfNot(this.log_value.returns.varType instanceof TS.ReferenceClassType, 'Expected reference', this.log_value);
            if (!this.cs) return false;

            var reference = <TS.ReferenceClassType> this.log_value.returns.varType;
            this.returns = new TS.RValueOfType(reference.referencedPrototypeType);

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_value.run(environment);

            var reference = <TS.Reference> environment.popTempValue().getValue();

            environment.pushTempAlias(reference.reference);

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class ValueOf extends Element {
        getJSONName() { return 'ValueOf' }
        c_object: C.DropField
        constructor(
            object: E.Element = null) {
            super();
            this.c_object = new C.DropField(this, object)
            this.initialize([
                [
                    new C.Label('val of'),
                    this.c_object,
                ]
            ], ElementType.Value);
        }
        constructCode(): L.LogicElement {
            var logic = new L.ValueOf(
                this.c_object.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new ValueOf(
                this.c_object.getContentCopy()).copyMetadata(this);
        }
    }
} 