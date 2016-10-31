module L {
    export class ReferenceOf extends LogicElement {
        constructor(
            public log_value: LogicElement
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_value);
            this.cs = this.log_value.compile(environment) && this.cs;
            if (!this.cs) return false;

            this.errorIfNot(this.log_value.returns instanceof TS.LValueOfType, 'Expected l-value', this.log_value);
            if (!this.cs) return false;

            var valueType = this.log_value.returns.varType;
            this.errorIfNot(valueType instanceof TS.InstanceType, 'Expected type instance', this.log_value);
            if (!this.cs) return false;

            var instanceType = <TS.InstanceType> valueType;
            this.returns = new TS.LValueOfType(new TS.ReferenceType(new TS.ReferenceClassType(instanceType.prototypeType)));

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {

            yield* this.log_value.run(environment);

            var field = environment.popTempValue();
            var value = <TS.Instance> field.getValue();

            environment.pushTempValue(new TS.Reference(new TS.ReferenceClass(value.prototype), field));

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class ReferenceOf extends Element {
        getJSONName() { return 'ReferenceOf' }
        c_object: C.DropField
        constructor(
            object: E.Element = null) {
            super();
            this.c_object = new C.DropField(this)
            this.initialize([
                [
                    new C.Label('ref of'),
                    this.c_object,
                ]
            ], ElementType.Value);
        }
        constructCode(): L.LogicElement {
            var logic = new L.ReferenceOf(
                this.c_object.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new ReferenceOf(
                this.c_object.getContentCopy()).copyMetadata(this);
        }
    }
} 