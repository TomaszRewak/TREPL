module L {
    export class VarImplicitDefinition extends VarDefinition {
        constructor(
            public name: string,
            public log_value: LogicElement
            ) {
            super(
                name,
                new TypeOf(log_value).setAsInternalOperation(),
                log_value
                );
        }
    }
}

module E {
    export class VariableImplicitDefinition extends Element {
        getJSONName() { return 'VariableImplicitDefinition' }
        c_name: C.TextField
        c_value: C.DropField
        constructor(name = 'foo', value: Element = null) {
            super();
            this.c_name = new C.TextField(this, name)
            this.c_value = new C.DropField(this, value)
            this.initialize([
                [new C.Label('var'), this.c_name, new C.Label('='), this.c_value]
            ],
                ElementType.Variable);
        }
        constructCode(): L.LogicElement {
            var logic = new L.VarImplicitDefinition(
                this.c_name.getRawData(),
                this.c_value.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new VariableImplicitDefinition(
                this.c_name.getRawData(),
                this.c_value.getContentCopy()).copyMetadata(this);
        }
    }
} 