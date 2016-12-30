module E {
    export class Comment extends Element {
        getJSONName() { return 'Comment' }
        c_data: C.TextField;
        constructor(value: string = 'foo') {
            super();
            this.c_data = new C.TextField(this, value);
            this.initialize([
                [new C.Label('//'), this.c_data]
            ], ElementType.Other);
        }
        constructCode(): L.LogicElement {
            var emptyElement = new L.EmptyElement();
            emptyElement.setObserver(this);
            return emptyElement;
        }
        getCopy(): Element {
            return new Comment(this.c_data.getRawData()).copyMetadata(this);
        }
    }
}

module E {
    export class MultilineComment extends Element {
        getJSONName() { return 'MultilineComment' }
        c_list: C.DropList;
        constructor(list: E.Element[] = []) {
            super();
            this.c_list = new C.DropList(this, list);
            this.initialize([
                [new C.Label('/*')],
                [this.c_list],
                [new C.Label('*/')]
            ], ElementType.Other);
        }
        constructCode(): L.LogicElement {
            var emptyElement = new L.EmptyElement();
            emptyElement.setObserver(this);
            return emptyElement;
        }
        getCopy(): Element {
            return new MultilineComment(this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
}