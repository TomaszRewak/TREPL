// All parts that single element can be composed of
module C {
    export class Component {
        element: JQuery;
        elemValue: string = null;
        constructor(elemClass = '') {
            this.element = $('<div></div>');
            this.element.addClass(elemClass);
        }
        setValue(val: string) {
            val = val.replace('\n', '');
            this.elemValue = val;
            this.element.empty().append(val);
        }
        addContent(content: JQuery) {
            this.element.append(content);
            this.element.removeAttr('contenteditable');
        }
        propagate(fun: (element: E.Element) => void) { }
    }
    export class Label extends Component {
        constructor(public elemValue: string) {
            super('label');
            this.setValue(elemValue);
        }
        getValue(): string {
            return this.elemValue;
        }
    }
    export class TextField extends Component {
        constructor(private parent: E.Element, elemValue: string = null) {
            super('textField');
            GUI.makeEditable(this.element, parent);
            this.element.on('input',() => {
                parent.edited();
            });
            this.element.focus(() => {
                BufferManager.getBuffer().setSelectedElement(parent);
            });
            this.setValue(elemValue);
        }
        getRawData(): string {
            return this.element.text();
        }
        toJSONObject(): Object {
            return this.getRawData();
        }
    }
    export class PenetratingTextField extends Component {
        constructor(private parent: E.Element, elemValue: string = null) {
            super('textField');
            GUI.makeEditableWithHelpers(
                this.element,
                parent,
                this);
            this.element.on('input', () => {
                parent.edited();
            });
            this.element.focus(() => {
                BufferManager.getBuffer().setSelectedElement(parent);
            });
            this.setValue(elemValue);
        }
        getRawData(): string {
            return this.element.text();
        }
        toJSONObject(): Object {
            return this.getRawData();
        }
        getHelpers(text: string): GUI.IDisplayable[] {
            var allHelpers = MenuInflater.allHelpers;

            var currentHelpers: GUI.IDisplayable[] = [new GUI.StringHelper(text, '')];

            var resultType = this.parent.getInnerContext();

            if (resultType) {
                if (resultType instanceof TS.InstanceType) {
                    var prototype = resultType.prototypeType;
                    for (var funName in prototype.functions) {
                        currentHelpers.push(
                            new GUI.StringHelper(
                                funName,
                                prototype.functions[funName].declaresType().getTypeName()));
                    }
                    if (prototype instanceof TS.ClassType) {
                        for (var fieldName in prototype.fields) {
                            currentHelpers.push(
                                new GUI.StringHelper(
                                    fieldName,
                                    prototype.fields[fieldName].typ.getTypeName()));
                        }
                    }
                }
            }

            return currentHelpers;
        }
        helperSelected(helper: GUI.IDisplayable) {
            if (helper instanceof GUI.StringHelper) {
                var selected = (<GUI.StringHelper> helper).name;
                this.element.text(selected);
                this.parent.edited();
            }
            else throw 'Unrecognized helper';
        }
    }
    export class FieldAcceptingDroppable extends Component implements E.ElementParent, L.LogicElementObserver, GUI.IEditableHelpresSource {
        constructor(elemClass: string, protected parent: E.Element, protected elemCotent: E.Element = null) {
            super(elemClass);

            GUI.makeEditableWithHelpers(
                this.element,
                parent,
                this,
                (e) => {
                    if (e.keyCode == 86 && e.ctrlKey) {
                        var buffer = BufferManager.getBuffer();
                        if (buffer.hasCopiedElement()) {
                            this.attachElement(buffer.getCopy());
                            GUI.setEditable(this.element, false);
                            GUI.hideAllPlaceholders();
                        }
                    }
                });

            this.element.focus(() => {
                BufferManager.getBuffer().setSelectedElement(parent);
            });
        }
        getElement(): JQuery {
            return this.element;
        }
        getContentCopy(): E.Element {
            if (this.elemCotent)
                return this.elemCotent.getCopy();
            else return null;
        }
        attachElement(element: E.Element) {
            throw 'Interfaces method call';
        }
        detachElement() {
            throw 'Interfaces method call';
        }
        containsElement() {
            return this.elemCotent != null;
        }
        getContent(): E.Element {
            return this.elemCotent;
        }
        edited() {
            this.parent.edited();
        }
        // Logic element observer
        constructCode(): L.LogicElement {
            if (this.elemCotent)
                return this.elemCotent.constructCode();
            else {
                var emptyElement = new L.EmptyElement();
                emptyElement.setObserver(this);
                return emptyElement;
            }
        }
        executing() {
        }
        private visibleNames: DS.Stack<Compiler.NamedType> = null;
        compiled(resultType: TS.StaticResult, visibleNames: DS.Stack<Compiler.NamedType>) {
            this.visibleNames = visibleNames;
        }
        private errors: string[] = [];
        clearErrors() {
            this.getElement().removeClass('error');
            this.errors = [];
        }
        error(message: string) {
            this.getElement().addClass('error');
            this.errors.push(message);
        }
        getErrors(): string[] {
            return this.errors;
        }
        getDescription(): string {
            return '';
        }
        getHelpers(text: string): GUI.IDisplayable[] {
            var allHelpers = MenuInflater.allHelpers;

            var currentHelpers: GUI.IDisplayable[] = [new GUI.StringHelper(text, '')];

            var stackTop = this.visibleNames;
            var usedNames: { [name: string]: boolean } = {};
            while (stackTop) {
                var visibleElement = stackTop.top;

                if (!usedNames[visibleElement.name] && visibleElement.name.indexOf(text) == 0) {
                    usedNames[visibleElement.name] = true;
                    currentHelpers.push(new GUI.StringHelper(visibleElement.name, visibleElement.typ.getTypeName()));
                }

                stackTop = stackTop.tail;
            }

            for (var i = 0; i < allHelpers.length; i++) {
                if (allHelpers[i].shortcut.indexOf(text) == 0) {
                    var helper = new GUI.ElementHelper(allHelpers[i].element.getCopy());
                    if (allHelpers[i].shortcut == text)
                        currentHelpers.unshift(helper);
                    else
                        currentHelpers.push(helper);
                }
            }

            return currentHelpers;
        }
        helperSelected(helper: GUI.IDisplayable) {
            if (helper instanceof GUI.ElementHelper) {
                if (!this.containsElement()) {
                    var selected: E.Element = (<GUI.ElementHelper> helper).getHelper();
                    selected.detachElement();
                    this.attachElement(selected);

                    GUI.setEditable(this.element, false);
                }
            }
            else if (helper instanceof GUI.StringHelper) {
                if (!this.containsElement()) {
                    var selected: E.Element = new E.RawData((<GUI.StringHelper> helper).name);
                    selected.detachElement();
                    this.attachElement(selected);

                    GUI.setEditable(this.element, false);
                }
            }
            else throw 'Unrecognized helper';
        }
        isDisplayingProgress(): boolean { return false; }
        propagate(fun: (element: E.Element) => void) {
            if (this.elemCotent)
                this.elemCotent.propagate(fun);
        }
        toJSONObject(): Object {
            if (this.elemCotent)
                return this.elemCotent.toJSONObject();
            else
                return null;
        }
    }
    export class DropField extends FieldAcceptingDroppable {
        constructor(parent: E.Element, elemCotent: E.Element = null) {
            super('dropField', parent, elemCotent);

            if (elemCotent)
                this.attachElement(elemCotent);

            this.element.droppable({
                accept: '.codeElement',
                greedy: true,
                tolerance: 'pointer',
                drop: (event, ui) => {
                    var drag: E.Element = GUI.extractElement(ui.draggable);

                    if (this.elemCotent == null) {
                        drag.detachElement();
                        this.attachElement(drag);
                    }
                    GUI.hideAllPlaceholders();
                }
            });

            this.element.mousemove((e) => {
                var event: any = e.originalEvent;

                if (event.attribute != 'handled') {
                    event.attribute = 'handled';
                    GUI.getElementInfo().infoFor(this);
                }
            });
        }
        attachElement(element: E.Element) {
            this.element.empty();
            this.element.append(element.getElement());
            this.elemCotent = element;
            element.parent = this;
            GUI.setEditable(this.element, false);
            this.edited();
        }
        detachElement() {
            this.elemCotent.getElement().detach();
            this.elemCotent.parent = null;
            this.elemCotent = null;
            GUI.setEditable(this.element, true);
            this.edited();
        }
    }
    class DropListElement extends FieldAcceptingDroppable {
        private prevElement: DropListElement = null;
        private nextElement: DropListElement = null;

        constructor(protected parentList: DropList, elemCotent: E.Element = null) {
            super('dropListPlaceholder', parentList.parent, elemCotent);

            this.element.droppable({
                accept: '.codeElement',
                greedy: true,
                tolerance: 'pointer',
                drop: (event, ui) => {
                    var drag: E.Element = GUI.extractElement(ui.draggable);

                    drag.getElement().parent().width('');
                    drag.getElement().parent().height('');

                    if (this.elemCotent == null &&
                        (!this.prevElement || this.prevElement.elemCotent != drag) &&
                        (!this.nextElement || this.nextElement.elemCotent != drag)
                        ) {
                        drag.detachElement();
                        this.attachElement(drag);
                    }
                    GUI.hideAllPlaceholders();

                    this.getElement().parent().width('');
                    this.getElement().parent().height('');
                }
            });
            this.element.mousemove((e) => {
                var originalEvent = <any> e.originalEvent;
                if (!originalEvent.dropListHoverHandled) {
                    originalEvent.dropListHoverHandled = true;
                    this.showPlaceholder(true);
                }
                else {
                    this.showPlaceholder(false);
                }
            });
            this.element.mouseleave(
                (e) => {
                    this.showPlaceholder(false);
                });
        }
        showPlaceholder(show: boolean) {
            if (this.elemCotent) {
                GUI.showPlaceholder(this.nextElement.element, show ? 10 : 0);
                GUI.showPlaceholder(this.prevElement.element, show ? 10 : 0);
            }
            else {
                GUI.showPlaceholder(this.element, show ? 19 : 0);
            }
        }
        getContent(): E.Element {
            return this.elemCotent;
        }
        getContentCopy(): E.Element {
            if (this.elemCotent)
                return this.elemCotent.getCopy();
            else return null;
        }
        getNextElement(): DropListElement {
            return this.nextElement;
        }
        attachElement(element: E.Element) {
            this.element.empty();
            this.element.append(element.getElement());
            this.elemCotent = element;
            element.parent = this;
            GUI.setEditable(this.element, false);

            var newPrev = new DropListElement(this.parentList);
            var newNext = new DropListElement(this.parentList);

            var oldPrev = this.prevElement;
            var oldNext = this.nextElement;

            newPrev.prevElement = oldPrev;
            newPrev.nextElement = this;
            newNext.prevElement = this;
            newNext.nextElement = oldNext;

            this.prevElement = newPrev;
            this.nextElement = newNext;

            if (oldPrev)
                oldPrev.nextElement = newPrev;
            else
                this.parentList.firstElement = newPrev;

            if (oldNext)
                oldNext.prevElement = newNext;
            else
                this.parentList.lastElement = newNext;

            newPrev.getElement().insertBefore(this.element);
            newNext.getElement().insertAfter(this.element);
            this.edited();
        }
        detachElement() {
            this.elemCotent.getElement().detach();
            this.elemCotent.parent = null;
            this.elemCotent = null;
            GUI.setEditable(this.element, true);

            var oldPrev = this.prevElement;
            var oldNext = this.nextElement;

            var newPrev = oldPrev.prevElement;
            var newNext = oldNext.nextElement;

            this.prevElement = newPrev;
            this.nextElement = newNext;

            if (newPrev)
                newPrev.nextElement = this;
            else
                this.parentList.firstElement = this;

            if (newNext)
                newNext.prevElement = this;
            else
                this.parentList.lastElement = this;

            oldPrev.getElement().detach();
            oldNext.getElement().detach();
            this.edited();
        }
        edited() {
            this.parentList.edited();
        }
    }
    export class DropList extends Component {
        firstElement: DropListElement;
        lastElement: DropListElement;

        constructor(public parent: E.Element, elemsCotent: E.Element[] = null) {
            super('dropList');
            this.firstElement = this.lastElement = new DropListElement(this);
            this.element.append(this.firstElement.getElement());

            if (elemsCotent) {
                for (var i = 0; i < elemsCotent.length; i++) {
                    this.lastElement.attachElement(elemsCotent[i]);
                }
            }
        }
        getLogicComponents(): L.LogicElement[]{
            var elements: L.LogicElement[] = []

            var actualElement = this.firstElement;
            while (actualElement) {
                elements.push(actualElement.constructCode());

                actualElement = actualElement.getNextElement();
            }

            return elements;
        }
        getContentCopy(): E.Element[]{
            var copy: E.Element[] = [];

            var actualElement = this.firstElement;
            while (actualElement) {
                var contentCopy = actualElement.getContentCopy();
                if (contentCopy)
                    copy.push(contentCopy);

                actualElement = actualElement.getNextElement();
            }

            return copy;
        }
        edited() {
            this.parent.edited();
        }
        propagate(fun: (element: E.Element) => void) {
            var actualElement = this.firstElement;
            while (actualElement) {
                actualElement.propagate(fun);
                actualElement = actualElement.getNextElement();
            }
        }
        toJSONObject(): Object {
            var jsons = [];

            var actualElement = this.firstElement;
            while (actualElement) {
                var json = actualElement.toJSONObject();
                if (json)
                    jsons.push(json);
                actualElement = actualElement.getNextElement();
            }

            return jsons;
        }
    }
} 