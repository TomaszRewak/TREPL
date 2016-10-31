module L {
    export class Return extends LogicElement {
        constructor(
            public log_value: LogicElement
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_value);
            this.cs = this.log_value.compile(environment) && this.cs;
            this.errorIfNot(environment.isInContext(Compiler.Context.Function), 'You can return valus only form inside of a function');
            this.errorIfTypeMismatch(TS.rValue(environment.getFunctionExpection()), this.log_value.returns, this);
            this.flowState = Compiler.FlowState.Return;
            if (!this.cs) return false;

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_value.run(environment);

            var value = environment.popTempValue().getValue().getCopy();
            environment.pushTempValue(value);
            environment.flowState = Memory.FlowState.Return;

            yield Operation.flow(this);

            return;
        }
    }
}

module E {
    export class Return extends Element {
        getJSONName() { return 'Return' }
        c_value: C.DropField
        constructor(mesage: E.Element = null) {
            super();
            this.c_value = new C.DropField(this, mesage)
            this.initialize([  // TODO: Zmienić
                [
                    new C.Label('return'),
                    this.c_value,
                ]
            ], ElementType.Function);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Return(
                this.c_value.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Return(
                this.c_value.getContentCopy()).copyMetadata(this);
        }
    }
} 