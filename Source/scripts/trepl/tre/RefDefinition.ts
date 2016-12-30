module L {
    export class RefDefinition extends VarDefinition {
        constructor(
            name: string,
            log_type: LogicElement,
            log_value: LogicElement
            ) {
            super(
                name,
                new Ref(log_type).setAsInternalOperation(),
                log_value
                );
        }
    }
}

module E {
    export class ReferenceDefinition extends Element {
        getJSONName() { return 'ReferenceDefinition' }
        c_name: C.TextField
        c_type: C.DropField
        c_value: C.DropField
        constructor(name = 'foo', typ: Element = null, value: Element = null) {
            super();
            this.c_name = new C.TextField(this, name)
            this.c_type = new C.DropField(this, typ)
            this.c_value = new C.DropField(this, value)
            this.initialize([
                [new C.Label('ref'), this.c_name, new C.Label(':'), this.c_type, new C.Label('='), this.c_value]
            ],
                ElementType.Variable);
        }
        constructCode(): L.LogicElement {
            var logic = new L.RefDefinition(
                this.c_name.getRawData(),
                this.c_type.constructCode(),
                this.c_value.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new ReferenceDefinition(
                this.c_name.getRawData(),
                this.c_type.getContentCopy(),
                this.c_value.getContentCopy()).copyMetadata(this);
        }
    }
} 