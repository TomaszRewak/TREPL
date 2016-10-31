module L {
    export class VarDefinition extends IDeclaration {
        constructor(
            public name: string,
            public log_type: LogicElement,
            public log_value: LogicElement
            ) { super(name); }

        expectsType: TS.StaticResult;
        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_type);
            this.cs = this.log_type.compile(environment) && this.cs;
            this.errorIfEmpty(this.log_value);
            this.cs = this.log_value.compile(environment) && this.cs;
            if (!this.cs) return false;

            var typeType = this.log_type.returns.varType;
            this.errorIfNot(typeType instanceof TS.PrototypeType, 'Expected type definition', this.log_type);
            if (!this.cs) return false;

            var valType = this.log_value.returns.varType;
            this.errorIfNot(valType instanceof TS.InstanceType, 'Expected object instance', this.log_value);
            if (!this.cs) return false;

            var declarationClass = <TS.PrototypeType> typeType;
            environment.addElement(this.name, declarationClass.declaresType());
            var prototypeType = <TS.PrototypeType> typeType;
            this.expectsType = new TS.RValueOfType(declarationClass.declaresType());

            this.errorIfTypeMismatch(this.expectsType, this.log_value.returns, this.log_value);
            if (!this.cs) return false;

            return this.cs;
        }

        *createTempValue(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_value.run(environment);

            return;
        }

        *instantiate(environment: Memory.Environment): IterableIterator<Operation> {
            environment.addValueToStack(environment.popTempValue().getValue().getCopy(), this.name);
            return;
        }
    }
}

module E {
    export class VariableDefinition extends Element {
        getJSONName() { return 'VariableDefinition' }
        c_name: C.TextField
        c_type: C.DropField
        c_value: C.DropField
        constructor(name = 'foo', typ: Element = null, value: Element = null) {
            super();
            this.c_name = new C.TextField(this, name)
            this.c_type = new C.DropField(this, typ)
            this.c_value = new C.DropField(this, value)
            this.initialize([
                [
                    new C.Label('var'),
                    this.c_name,
                    new C.Label(':'),
                    this.c_type,
                    new C.Label('='),
                    this.c_value
                ]
            ],
                ElementType.Variable);
        }
        constructCode(): L.LogicElement {
            var logic = new L.VarDefinition(
                this.c_name.getRawData(),
                this.c_type.constructCode(),
                this.c_value.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new VariableDefinition(
                this.c_name.getRawData(),
                this.c_type.getContentCopy(),
                this.c_value.getContentCopy()).copyMetadata(this);
        }
    }
} 