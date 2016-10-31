module L {
    export class DefaultValue extends LogicElement {
        constructor(
            public log_type: LogicElement
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_type);
            this.cs = this.log_type.compile(environment) && this.cs;
             if (!this.cs) return false;

            this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
            if (!this.cs) return false;

            var elemesType = <TS.PrototypeType> this.log_type.returns.varType;

            this.returns = new TS.RValueOfType(elemesType.declaresType());

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_type.run(environment);

            var elemType = <TS.Prototype> environment.popTempValue().getValue();

            var object = elemType.defaultValue();
            yield* object.construct(environment);

            environment.pushTempValue(object);

            return;
        }
    }
}

module E {
    export class DefaultValue extends Element { // Add implementation
        getJSONName() { return 'DefaultValue' }
        c_type: C.DropField
        constructor(
            typ: E.Element = null) {
            super();
            this.c_type = new C.DropField(this, typ),
            this.initialize([
                [
                    new C.Label('default value'),
                    this.c_type,
                ],
            ], ElementType.Value);
        }
        constructCode(): L.LogicElement {
            var logic = new L.DefaultValue(
                this.c_type.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new DefaultValue(
                this.c_type.getContentCopy()).copyMetadata(this);
        }
    }
}