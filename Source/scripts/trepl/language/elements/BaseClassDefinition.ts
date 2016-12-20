module L {
    export class BaseClassDefinition extends ClassDefinition {
    }
}

module E {
    export class BaseClassDefinition extends Element {
        getJSONName() { return 'BaseClassDefinition' }
        c_name: C.TextField
        c_list: C.DropList
        constructor(
            name = 'foo',
            list: E.Element[] = []) {
            super();
            this.c_name = new C.TextField(this, name),
            this.c_list = new C.DropList(this, list)
            this.initialize([
                [
                    new C.Label('class'),
                    this.c_name,
                ],
                [
                    new C.Label('{'),
                ],
                [
                    this.c_list,
                ],
                [
                    new C.Label('}'),
                ]
            ], ElementType.Type);
        }
        constructCode(): L.LogicElement {
            var logic = new L.BaseClassDefinition(
                this.c_name.getRawData(),
                new L.Any(),
                this.c_list.getLogicComponents()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new BaseClassDefinition(
                this.c_name.getRawData(),
                this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
} 