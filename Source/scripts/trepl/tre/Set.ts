module L {
    export class Set extends LogicElement {
        constructor(
            public log_left: LogicElement,
            public log_right: LogicElement
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment) {
            this.errorIfEmpty(this.log_left);
            this.errorIfEmpty(this.log_right);
            this.cs = this.log_right.compile(environment) && this.cs;
            this.cs = this.log_left.compile(environment) && this.cs;

            if (!this.cs) return false;

            this.errorIfNot(this.log_left.returns instanceof TS.LValueOfType, 'Expected L-value', this.log_left);
            if (!this.cs) return false;

            var leftType = this.log_left.returns.varType;
            var rightType = this.log_right.returns.varType;

            this.errorIfNot(leftType instanceof TS.InstanceType, 'Expected type instance', this.log_left);
            this.errorIfNot(rightType instanceof TS.InstanceType, 'Expected type instance', this.log_right);
            if (!this.cs) return false;

            this.errorIfTypeMismatch(TS.rValue(leftType), this.log_right.returns, this.log_right);
            if (!this.cs) return false;

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_right.run(environment);
            yield* this.log_left.run(environment);

            var valueLeft = environment.popTempValue();
            var valueRight = environment.popTempValue();

            valueLeft.setValue(valueRight.getValue().getCopy());
            //environment.pushTempValue(valueRight.getValue().getCopy());

            yield Operation.memory(this);

            return;
        }
    }
}

module E {
    export class Set extends Element {
        getJSONName() { return 'Set' }
        c_left: C.DropField
        c_right: C.DropField
        constructor(left: E.Element = null, right: E.Element = null) {
            super();
            this.c_left = new C.DropField(this, left),
            this.c_right = new C.DropField(this, right)
            this.initialize([  // TODO: Zmienić
                [this.c_left, new C.Label('='), this.c_right]
            ],
                ElementType.Variable);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Set(
                this.c_left.constructCode(),
                this.c_right.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Set(
                this.c_left.getContentCopy(),
                this.c_right.getContentCopy()).copyMetadata(this);
        }
    }
} 