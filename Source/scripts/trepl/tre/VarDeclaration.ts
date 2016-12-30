module L {
    export class VarDeclaration extends VarDefinition {
        constructor(
            name: string,
            log_type: LogicElement
            ) {
            super(
                name,
                log_type,
                new DefaultValue(log_type).setAsInternalOperation()
                );
        }
    }
}

module E {
    export class VariableDeclaration extends Element {
        getJSONName() { return 'VariableDeclaration' }
        c_name: C.TextField
        c_type: C.DropField
        constructor(name: string = 'foo', typ: Element = null) {
            super();
            this.c_name = new C.TextField(this, name)
            this.c_type = new C.DropField(this, typ)
            this.initialize([
                [new C.Label('var'), this.c_name, new C.Label(':'), this.c_type]
            ],
                ElementType.Variable);
        }
        constructCode(): L.LogicElement {
            var logic = new L.VarDeclaration(
                this.c_name.getRawData(),
                this.c_type.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new VariableDeclaration(
                this.c_name.getRawData(),
                this.c_type.getContentCopy()).copyMetadata(this);
        }
    }
} 