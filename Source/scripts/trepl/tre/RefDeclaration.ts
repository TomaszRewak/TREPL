module L {
    export class RefDeclaration extends VarDeclaration {
        constructor(
            name: string,
            log_type: LogicElement
            ) {
            super(
                name,
                new Ref(log_type).setAsInternalOperation()
                );
        }
    }
}

module E {
    export class ReferenceDeclaration extends Element {
        getJSONName() { return 'ReferenceDeclaration' }
        c_name: C.TextField
        c_type: C.DropField
        constructor(name = 'foo', typ: Element = null) {
            super();
            this.c_name = new C.TextField(this, name)
            this.c_type = new C.DropField(this, typ)
            this.initialize([
                [new C.Label('ref'), this.c_name, new C.Label(':'), this.c_type]
            ],
                ElementType.Variable);
        }
        constructCode(): L.LogicElement {
            var logic = new L.RefDeclaration(
                this.c_name.getRawData(),
                this.c_type.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new ReferenceDeclaration(
                this.c_name.getRawData(),
                this.c_type.getContentCopy()).copyMetadata(this);
        }
    }
} 