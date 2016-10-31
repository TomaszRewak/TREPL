/**
 * TREPL - TRE is an object oriented, functional programming language, that enables user to view all processes happening inside a memory during program execution.
 * Version: v1.0.4
 * Website: http://trepl.xyz
 * Author: Tomasz Rewak (tomasz.rewak@gmail.com)
 *
 * The MIT License (MIT)
 * Copyright(c) 2016 Tomasz Rewak 
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and / or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject tothe following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var Commons;
(function (Commons) {
    Commons.data_ElementClass = 'ELEMENT_CLASS';
    Commons.data_ElementObject = 'ELEMENT_OBJECT';
    Commons.data_Logic = 'ELEMENT_LOGIC';
    Commons.data_LogicTag = 'ELEMENT_LOGIC_TAG';
})(Commons || (Commons = {}));
var C;
(function (C) {
    class Component {
        constructor(elemClass = '') {
            this.elemValue = null;
            this.element = $('<div></div>');
            this.element.addClass(elemClass);
        }
        setValue(val) {
            val = val.replace('\n', '');
            this.elemValue = val;
            this.element.empty().append(val);
        }
        addContent(content) {
            this.element.append(content);
            this.element.removeAttr('contenteditable');
        }
        propagate(fun) { }
    }
    C.Component = Component;
    class Label extends Component {
        constructor(elemValue) {
            super('label');
            this.elemValue = elemValue;
            this.setValue(elemValue);
        }
        getValue() {
            return this.elemValue;
        }
    }
    C.Label = Label;
    class TextField extends Component {
        constructor(parent, elemValue = null) {
            super('textField');
            this.parent = parent;
            GUI.makeEditable(this.element, parent);
            this.element.on('input', () => {
                parent.edited();
            });
            this.element.focus(() => {
                BufferManager.getBuffer().setSelectedElement(parent);
            });
            this.setValue(elemValue);
        }
        getRawData() {
            return this.element.text();
        }
        toJSONObject() {
            return this.getRawData();
        }
    }
    C.TextField = TextField;
    class PenetratingTextField extends Component {
        constructor(parent, elemValue = null) {
            super('textField');
            this.parent = parent;
            GUI.makeEditableWithHelpers(this.element, parent, this);
            this.element.on('input', () => {
                parent.edited();
            });
            this.element.focus(() => {
                BufferManager.getBuffer().setSelectedElement(parent);
            });
            this.setValue(elemValue);
        }
        getRawData() {
            return this.element.text();
        }
        toJSONObject() {
            return this.getRawData();
        }
        getHelpers(text) {
            var allHelpers = MenuInflater.allHelpers;
            var currentHelpers = [new GUI.StringHelper(text, '')];
            var resultType = this.parent.getInnerContext();
            if (resultType) {
                if (resultType instanceof TS.InstanceType) {
                    var prototype = resultType.prototypeType;
                    for (var funName in prototype.functions) {
                        currentHelpers.push(new GUI.StringHelper(funName, prototype.functions[funName].declaresType().getTypeName()));
                    }
                    if (prototype instanceof TS.ClassType) {
                        for (var fieldName in prototype.fields) {
                            currentHelpers.push(new GUI.StringHelper(fieldName, prototype.fields[fieldName].typ.getTypeName()));
                        }
                    }
                }
            }
            return currentHelpers;
        }
        helperSelected(helper) {
            if (helper instanceof GUI.StringHelper) {
                var selected = helper.name;
                this.element.text(selected);
                this.parent.edited();
            }
            else
                throw 'Unrecognized helper';
        }
    }
    C.PenetratingTextField = PenetratingTextField;
    class FieldAcceptingDroppable extends Component {
        constructor(elemClass, parent, elemCotent = null) {
            super(elemClass);
            this.parent = parent;
            this.elemCotent = elemCotent;
            this.visibleNames = null;
            this.errors = [];
            GUI.makeEditableWithHelpers(this.element, parent, this, (e) => {
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
        getElement() {
            return this.element;
        }
        getContentCopy() {
            if (this.elemCotent)
                return this.elemCotent.getCopy();
            else
                return null;
        }
        attachElement(element) {
            throw 'Interfaces method call';
        }
        detachElement() {
            throw 'Interfaces method call';
        }
        containsElement() {
            return this.elemCotent != null;
        }
        getContent() {
            return this.elemCotent;
        }
        edited() {
            this.parent.edited();
        }
        constructCode() {
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
        compiled(resultType, visibleNames) {
            this.visibleNames = visibleNames;
        }
        clearErrors() {
            this.getElement().removeClass('error');
            this.errors = [];
        }
        error(message) {
            this.getElement().addClass('error');
            this.errors.push(message);
        }
        getErrors() {
            return this.errors;
        }
        getDescription() {
            return '';
        }
        getHelpers(text) {
            var allHelpers = MenuInflater.allHelpers;
            var currentHelpers = [new GUI.StringHelper(text, '')];
            var stackTop = this.visibleNames;
            var usedNames = {};
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
        helperSelected(helper) {
            if (helper instanceof GUI.ElementHelper) {
                if (!this.containsElement()) {
                    var selected = helper.getHelper();
                    selected.detachElement();
                    this.attachElement(selected);
                    GUI.setEditable(this.element, false);
                }
            }
            else if (helper instanceof GUI.StringHelper) {
                if (!this.containsElement()) {
                    var selected = new E.RawData(helper.name);
                    selected.detachElement();
                    this.attachElement(selected);
                    GUI.setEditable(this.element, false);
                }
            }
            else
                throw 'Unrecognized helper';
        }
        isDisplayingProgress() { return false; }
        propagate(fun) {
            if (this.elemCotent)
                this.elemCotent.propagate(fun);
        }
        toJSONObject() {
            if (this.elemCotent)
                return this.elemCotent.toJSONObject();
            else
                return null;
        }
    }
    C.FieldAcceptingDroppable = FieldAcceptingDroppable;
    class DropField extends FieldAcceptingDroppable {
        constructor(parent, elemCotent = null) {
            super('dropField', parent, elemCotent);
            if (elemCotent)
                this.attachElement(elemCotent);
            this.element.droppable({
                accept: '.codeElement',
                greedy: true,
                tolerance: 'pointer',
                drop: (event, ui) => {
                    var drag = GUI.extractElement(ui.draggable);
                    if (this.elemCotent == null) {
                        drag.detachElement();
                        this.attachElement(drag);
                    }
                    GUI.hideAllPlaceholders();
                }
            });
            this.element.mousemove((e) => {
                var event = e.originalEvent;
                if (event.attribute != 'handled') {
                    event.attribute = 'handled';
                    GUI.getElementInfo().infoFor(this);
                }
            });
        }
        attachElement(element) {
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
    C.DropField = DropField;
    class DropListElement extends FieldAcceptingDroppable {
        constructor(parentList, elemCotent = null) {
            super('dropListPlaceholder', parentList.parent, elemCotent);
            this.parentList = parentList;
            this.prevElement = null;
            this.nextElement = null;
            this.element.droppable({
                accept: '.codeElement',
                greedy: true,
                tolerance: 'pointer',
                drop: (event, ui) => {
                    var drag = GUI.extractElement(ui.draggable);
                    drag.getElement().parent().width('');
                    drag.getElement().parent().height('');
                    if (this.elemCotent == null &&
                        (!this.prevElement || this.prevElement.elemCotent != drag) &&
                        (!this.nextElement || this.nextElement.elemCotent != drag)) {
                        drag.detachElement();
                        this.attachElement(drag);
                    }
                    GUI.hideAllPlaceholders();
                    this.getElement().parent().width('');
                    this.getElement().parent().height('');
                }
            });
            this.element.mousemove((e) => {
                var originalEvent = e.originalEvent;
                if (!originalEvent.dropListHoverHandled) {
                    originalEvent.dropListHoverHandled = true;
                    this.showPlaceholder(true);
                }
                else {
                    this.showPlaceholder(false);
                }
            });
            this.element.mouseleave((e) => {
                this.showPlaceholder(false);
            });
        }
        showPlaceholder(show) {
            if (this.elemCotent) {
                GUI.showPlaceholder(this.nextElement.element, show ? 10 : 0);
                GUI.showPlaceholder(this.prevElement.element, show ? 10 : 0);
            }
            else {
                GUI.showPlaceholder(this.element, show ? 19 : 0);
            }
        }
        getContent() {
            return this.elemCotent;
        }
        getContentCopy() {
            if (this.elemCotent)
                return this.elemCotent.getCopy();
            else
                return null;
        }
        getNextElement() {
            return this.nextElement;
        }
        attachElement(element) {
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
    class DropList extends Component {
        constructor(parent, elemsCotent = null) {
            super('dropList');
            this.parent = parent;
            this.firstElement = this.lastElement = new DropListElement(this);
            this.element.append(this.firstElement.getElement());
            if (elemsCotent) {
                for (var i = 0; i < elemsCotent.length; i++) {
                    this.lastElement.attachElement(elemsCotent[i]);
                }
            }
        }
        getLogicComponents() {
            var elements = [];
            var actualElement = this.firstElement;
            while (actualElement) {
                elements.push(actualElement.constructCode());
                actualElement = actualElement.getNextElement();
            }
            return elements;
        }
        getContentCopy() {
            var copy = [];
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
        propagate(fun) {
            var actualElement = this.firstElement;
            while (actualElement) {
                actualElement.propagate(fun);
                actualElement = actualElement.getNextElement();
            }
        }
        toJSONObject() {
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
    C.DropList = DropList;
})(C || (C = {}));
var L;
(function (L) {
    (function (OperationType) {
        OperationType[OperationType["MemoryOperation"] = 0] = "MemoryOperation";
        OperationType[OperationType["TempMemoryOperation"] = 1] = "TempMemoryOperation";
        OperationType[OperationType["InternalOperation"] = 2] = "InternalOperation";
        OperationType[OperationType["FlowOperation"] = 3] = "FlowOperation";
        OperationType[OperationType["WaitOperation"] = 4] = "WaitOperation";
        OperationType[OperationType["OtherOperation"] = 5] = "OtherOperation";
        OperationType[OperationType["Done"] = 6] = "Done";
    })(L.OperationType || (L.OperationType = {}));
    var OperationType = L.OperationType;
    class Operation {
        constructor(operationType, element) {
            this.operationType = operationType;
            this.element = element;
        }
        static memory(element) {
            return new Operation(OperationType.MemoryOperation, element);
        }
        static tempMemory(element) {
            return new Operation(OperationType.TempMemoryOperation, element);
        }
        static internal(element) {
            return new Operation(OperationType.InternalOperation, element);
        }
        static flow(element) {
            return new Operation(OperationType.FlowOperation, element);
        }
        static wait() {
            return new Operation(OperationType.WaitOperation, null);
        }
        static other(element) {
            return new Operation(OperationType.OtherOperation, element);
        }
    }
    L.Operation = Operation;
    class EmptyLogicElementObserver {
        getElement() { return null; }
        error(message) { }
        executing() { }
        constructCode() { return null; }
        clearErrors() { }
        compiled(resultType, visibleNames, context) { }
        getDescription() { return ''; }
        getErrors() { return []; }
        isDisplayingProgress() { return false; }
    }
    class LogicElement {
        constructor() {
            this.observer = new EmptyLogicElementObserver();
            this.flowState = Compiler.FlowState.Normal;
            this.returns = new TS.RValueOfType(new TS.ClassObjectType(TS.Void.typeInstance));
            this.logicComponents = {};
            this.cs = true;
            this.defalutOperation = null;
        }
        setObserver(observer) {
            this.observer = observer;
            this.observer.clearErrors();
        }
        getObserver() {
            return this.observer;
        }
        compile(environment) {
            var compilationResult = this._compile(environment);
            this.observer.compiled(compilationResult ? this.returns : null, environment.getNamesOnStack(), this.innerContext);
            return compilationResult;
        }
        _compile(environment) {
            return false;
        }
        compileBlock(environment, elements) {
            var flowState = Compiler.FlowState.Normal;
            var i = 0;
            for (; i < elements.length; i++) {
                var element = elements[i];
                this.cs = element.compile(environment) && this.cs;
                if (element.flowState != Compiler.FlowState.Normal) {
                    flowState = element.flowState;
                    break;
                }
            }
            for (i++; i < elements.length; i++) {
                var element = elements[i];
                if (element instanceof L.EmptyElement)
                    continue;
                this.error('This operation is not reachable', element);
            }
            return flowState;
        }
        returnsType() {
            return this.returns.varType;
        }
        *run(environment) {
            environment.addTempStackScope();
            var operations = this.execute(environment);
            var next = operations.next();
            while (!next.done) {
                var value = next.value;
                if (this.defalutOperation && value.element == this)
                    yield this.defalutOperation;
                else
                    yield value;
                next = operations.next();
            }
            if (!environment.hasValueOnCurrentLevel())
                environment.pushTempValue(TS.Void.classInstance.defaultValue());
            environment.removeTempScope();
            return;
        }
        *execute(environment) {
            return;
        }
        static *executeBlock(environment, list) {
            for (var i = 0; i < list.length; i++) {
                yield* list[i].run(environment);
                if (environment.flowState == Memory.FlowState.Return) {
                    environment.passTempValue();
                    return;
                }
                else if (environment.flowState != Memory.FlowState.NormalFlow)
                    return;
                else
                    environment.clearCurrentTempScope();
            }
        }
        error(message, element = this) {
            this.cs = false;
            element.cs = false;
            element.observer.error(message);
        }
        errorIf(condition, message, element = this) {
            if (condition)
                this.error(message, element);
        }
        errorIfNot(condition, message, element = this) {
            this.errorIf(!condition, message, element);
        }
        errorIfEmpty(element) {
            if (!element || element instanceof L.EmptyElement) {
                this.error('This field cannot be empty', element);
            }
        }
        errorIfTypeMismatch(expected, found, element) {
            if ((expected instanceof TS.LValueOfType) && !(found instanceof TS.LValueOfType)) {
                this.error('Type mismatch: expected L-Value of type"' + expected.varType.getTypeName() + '", but found R-Value of type"' + found.varType.getTypeName() + '"', element);
            }
            else {
                if (!found.varType.assignalbeTo(expected.varType)) {
                    this.error('Type mismatch: expected "' + expected.varType.getTypeName() + '", but found "' + found.varType.getTypeName() + '"', element);
                }
            }
        }
        errorIfNotInstance(typ, element) {
            this.errorIfNot(typ instanceof TS.InstanceType, 'Expected type instance', element);
        }
        errorIfNotPrototype(typ, element) {
            this.errorIfNot(typ instanceof TS.PrototypeType, 'Expected type prototype', element);
        }
        setAsInternalOperation() {
            this.defalutOperation = Operation.internal(this);
            return this;
        }
    }
    L.LogicElement = LogicElement;
    class IDeclaration extends LogicElement {
        constructor(name) {
            super();
            this.name = name;
        }
        *execute(environment) {
            yield* this.createTempValue(environment);
            yield* this.instantiate(environment);
            yield Operation.memory(this);
            return;
        }
        *instantiate(environment) {
            throw 'abstract class member call';
        }
        *createTempValue(environment) {
            throw 'abstract class member call';
        }
    }
    L.IDeclaration = IDeclaration;
})(L || (L = {}));
var Operation = L.Operation;
var E;
(function (E) {
    class HelperParent {
        constructor(element) {
            this.element = element;
        }
        detachElement() {
            var newHelper = this.element.getCopy();
            newHelper.getElement().insertAfter(this.element.getElement());
            this.element.parent = null;
        }
        attachElement(element) { }
        containsElement() {
            return true;
        }
        edited() {
        }
    }
    (function (ElementType) {
        ElementType[ElementType["Value"] = 0] = "Value";
        ElementType[ElementType["Flow"] = 1] = "Flow";
        ElementType[ElementType["Variable"] = 2] = "Variable";
        ElementType[ElementType["Type"] = 3] = "Type";
        ElementType[ElementType["Math"] = 4] = "Math";
        ElementType[ElementType["Function"] = 5] = "Function";
        ElementType[ElementType["Other"] = 6] = "Other";
        ElementType[ElementType["Program"] = 7] = "Program";
    })(E.ElementType || (E.ElementType = {}));
    var ElementType = E.ElementType;
    var styles = {};
    styles[ElementType.Value] = 'valueCodeElement';
    styles[ElementType.Flow] = 'flowCodeElement';
    styles[ElementType.Variable] = 'variableCodeElement';
    styles[ElementType.Type] = 'typeSystemCodeElement';
    styles[ElementType.Math] = 'mathCodeElement';
    styles[ElementType.Function] = 'functionCodeElement';
    styles[ElementType.Other] = 'otherCodeElement';
    styles[ElementType.Program] = 'programCodeElement';
    class Element {
        constructor() {
            this.composedElement = null;
            this.parent = new HelperParent(this);
            this.errors = [];
            this.wasCompiled = false;
            this.visibleNames = null;
            this.innerContext = null;
            this._isDisplayingProgress = true;
        }
        setStyle(elemType) {
            if (styles[elemType])
                this.composedElement.addClass(styles[elemType]);
            else
                throw 'Unknown style';
        }
        clearStyles() {
            for (var i in styles)
                this.composedElement.removeClass(styles[i]);
        }
        initialize(components, elemType) {
            this.components = components;
            this.composedElement = $('<div tabindex="0"></div>');
            this.composedElement.addClass('codeElement');
            this.setStyle(elemType);
            this.composedElement.data(Commons.data_ElementClass, this.constructor);
            this.composedElement.data(Commons.data_ElementObject, this);
            for (var i = 0; i < components.length; i++) {
                var line = $('<div></div>');
                line.addClass('componentsLine');
                for (var j = 0; j < components[i].length; j++) {
                    var component = components[i][j].element;
                    line.append(component);
                }
                this.composedElement.append(line);
            }
            this.composedElement.mousemove((e) => {
                var event = e.originalEvent;
                if (event.attribute != 'handled') {
                    event.attribute = 'handled';
                    GUI.getElementInfo().infoFor(this);
                }
            });
            this.composedElement.mouseleave((e) => {
                GUI.getElementInfo().hideInfo();
            });
            this.composedElement.dblclick((e) => {
                var event = e.originalEvent;
                if (event.attribute != 'handled') {
                    event.attribute = 'handled';
                    this.shouldDisplayProgressPropagated(!this.isDisplayingProgress());
                }
            });
            this.composedElement.click((e) => {
                var event = e.originalEvent;
                if (event.elementSelected != 'selected') {
                    event.elementSelected = 'selected';
                    BufferManager.getBuffer().setSelectedElement(this);
                }
            });
            GUI.addStaticEvents(this.composedElement);
            GUI.addDynamicEvants(this.composedElement);
        }
        getElement() {
            return this.composedElement;
        }
        constructCode() {
            return null;
        }
        getCopy() {
            return null;
        }
        detachElement() {
            this.parent.detachElement();
        }
        executing() {
            GUI.getExecutionIndicator().indicate(this);
        }
        clearErrors() {
            this.getElement().parent().removeClass('error');
            this.getElement().removeClass('error');
            this.errors = [];
        }
        error(message) {
            this.getElement().addClass('error');
            this.errors.push(message);
        }
        getErrors() {
            return this.errors;
        }
        getDescription() {
            if (!this.wasCompiled)
                return '';
            if (this.resultType)
                return this.resultType.varType.getTypeName();
            else
                return 'compilation error';
        }
        getInnerContext() {
            return this.innerContext;
        }
        edited() {
            if (this.parent)
                this.parent.edited();
        }
        compiled(resultType, visibleNames, innerContext) {
            this.resultType = resultType;
            this.visibleNames = visibleNames;
            this.innerContext = innerContext;
            this.wasCompiled = true;
        }
        isDisplayingProgress() { return this._isDisplayingProgress; }
        shouldDisplayProgress(should) {
            this._isDisplayingProgress = should;
            if (should)
                this.composedElement.removeClass('withoutProgress');
            else
                this.composedElement.addClass('withoutProgress');
        }
        withoutProgress() {
            this.shouldDisplayProgress(false);
            return this;
        }
        shouldDisplayProgressPropagated(should) {
            this.propagate((element) => {
                element.shouldDisplayProgress(should);
            });
            return this;
        }
        copyMetadata(fromElement) {
            this.shouldDisplayProgress(fromElement.isDisplayingProgress());
            return this;
        }
        propagate(fun) {
            fun(this);
            this.components.forEach((val) => {
                val.forEach((val) => {
                    val.propagate(fun);
                });
            });
        }
        toJSONObject() {
            var params = [];
            this.components.forEach((val) => {
                val.forEach((val) => {
                    var v = val;
                    if (v.toJSONObject)
                        params.push(v.toJSONObject());
                });
            });
            return {
                element: this.getJSONName(),
                params: params,
                visible: this.isDisplayingProgress()
            };
        }
    }
    E.Element = Element;
})(E || (E = {}));
var JustToShowElements;
(function (JustToShowElements) {
    class Label extends E.Element {
        constructor() {
            super();
            this.initialize([
                [
                    new C.Label(''),
                    new C.Label('Label'),
                    new C.Label(''),
                ]
            ], E.ElementType.Value);
        }
        getJSONName() { return '-'; }
    }
    JustToShowElements.Label = Label;
    class Name extends E.Element {
        constructor() {
            super();
            this.initialize([
                [
                    new C.Label(''),
                    new C.TextField(this, 'Value'),
                    new C.Label(''),
                ]
            ], E.ElementType.Value);
        }
        getJSONName() { return '-'; }
    }
    JustToShowElements.Name = Name;
    class DropField extends E.Element {
        constructor() {
            super();
            this.initialize([
                [
                    new C.Label(''),
                    new C.DropField(this),
                    new C.Label(''),
                ]
            ], E.ElementType.Value);
        }
        getJSONName() { return '-'; }
    }
    JustToShowElements.DropField = DropField;
    class DropList extends E.Element {
        constructor() {
            super();
            this.initialize([
                [
                    new C.Label(''),
                    new C.DropList(this),
                    new C.Label(''),
                ]
            ], E.ElementType.Value);
        }
        getJSONName() { return '-'; }
    }
    JustToShowElements.DropList = DropList;
})(JustToShowElements || (JustToShowElements = {}));
var L;
(function (L) {
    class Array extends L.LogicElement {
        constructor(log_type, log_length) {
            super();
            this.log_type = log_type;
            this.log_length = log_length;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_type);
            if (!this.cs)
                return false;
            this.cs = this.log_type.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
            if (!this.cs)
                return false;
            this.length = parseInt(this.log_length);
            this.errorIf(isNaN(this.length), 'provided length is not a number');
            if (!this.cs)
                return false;
            this.errorIf(this.length <= 0, 'length must be greater then zero');
            if (!this.cs)
                return false;
            var prototypeType = this.log_type.returnsType();
            this.returns = new TS.RValueOfType(new TS.ArrayOfLengthClassType(prototypeType, this.length));
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_type.run(environment);
            var tempValue = environment.popTempValue().getValue();
            environment.pushTempValue(new TS.ArrayClass(tempValue, this.length));
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.Array = Array;
})(L || (L = {}));
var E;
(function (E) {
    class Array extends E.Element {
        constructor(typ = null, value = '4') {
            super();
            this.c_type = new C.DropField(this, typ);
            this.c_length = new C.TextField(this, value);
            this.initialize([
                [
                    this.c_type,
                    new C.Label('['),
                    this.c_length,
                    new C.Label(']'),
                ]
            ], E.ElementType.Type);
        }
        getJSONName() { return 'Array'; }
        constructCode() {
            var logic = new L.Array(this.c_type.constructCode(), this.c_length.getRawData());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Array(this.c_type.getContentCopy(), this.c_length.getRawData()).copyMetadata(this);
        }
    }
    E.Array = Array;
})(E || (E = {}));
var L;
(function (L) {
    class VarDefinition extends L.IDeclaration {
        constructor(name, log_type, log_value) {
            super(name);
            this.name = name;
            this.log_type = log_type;
            this.log_value = log_value;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_type);
            this.cs = this.log_type.compile(environment) && this.cs;
            this.errorIfEmpty(this.log_value);
            this.cs = this.log_value.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            var typeType = this.log_type.returns.varType;
            this.errorIfNot(typeType instanceof TS.PrototypeType, 'Expected type definition', this.log_type);
            if (!this.cs)
                return false;
            var valType = this.log_value.returns.varType;
            this.errorIfNot(valType instanceof TS.InstanceType, 'Expected object instance', this.log_value);
            if (!this.cs)
                return false;
            var declarationClass = typeType;
            environment.addElement(this.name, declarationClass.declaresType());
            var prototypeType = typeType;
            this.expectsType = new TS.RValueOfType(declarationClass.declaresType());
            this.errorIfTypeMismatch(this.expectsType, this.log_value.returns, this.log_value);
            if (!this.cs)
                return false;
            return this.cs;
        }
        *createTempValue(environment) {
            yield* this.log_value.run(environment);
            return;
        }
        *instantiate(environment) {
            environment.addValueToStack(environment.popTempValue().getValue().getCopy(), this.name);
            return;
        }
    }
    L.VarDefinition = VarDefinition;
})(L || (L = {}));
var E;
(function (E) {
    class VariableDefinition extends E.Element {
        constructor(name = 'foo', typ = null, value = null) {
            super();
            this.c_name = new C.TextField(this, name);
            this.c_type = new C.DropField(this, typ);
            this.c_value = new C.DropField(this, value);
            this.initialize([
                [
                    new C.Label('var'),
                    this.c_name,
                    new C.Label(':'),
                    this.c_type,
                    new C.Label('='),
                    this.c_value
                ]
            ], E.ElementType.Variable);
        }
        getJSONName() { return 'VariableDefinition'; }
        constructCode() {
            var logic = new L.VarDefinition(this.c_name.getRawData(), this.c_type.constructCode(), this.c_value.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new VariableDefinition(this.c_name.getRawData(), this.c_type.getContentCopy(), this.c_value.getContentCopy()).copyMetadata(this);
        }
    }
    E.VariableDefinition = VariableDefinition;
})(E || (E = {}));
var L;
(function (L) {
    class VarDeclaration extends L.VarDefinition {
        constructor(name, log_type) {
            super(name, log_type, new L.DefaultValue(log_type).setAsInternalOperation());
        }
    }
    L.VarDeclaration = VarDeclaration;
})(L || (L = {}));
var E;
(function (E) {
    class VariableDeclaration extends E.Element {
        constructor(name = 'foo', typ = null) {
            super();
            this.c_name = new C.TextField(this, name);
            this.c_type = new C.DropField(this, typ);
            this.initialize([
                [new C.Label('var'), this.c_name, new C.Label(':'), this.c_type]
            ], E.ElementType.Variable);
        }
        getJSONName() { return 'VariableDeclaration'; }
        constructCode() {
            var logic = new L.VarDeclaration(this.c_name.getRawData(), this.c_type.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new VariableDeclaration(this.c_name.getRawData(), this.c_type.getContentCopy()).copyMetadata(this);
        }
    }
    E.VariableDeclaration = VariableDeclaration;
})(E || (E = {}));
var L;
(function (L) {
    class VarImplicitDefinition extends L.VarDefinition {
        constructor(name, log_value) {
            super(name, new L.TypeOf(log_value).setAsInternalOperation(), log_value);
            this.name = name;
            this.log_value = log_value;
        }
    }
    L.VarImplicitDefinition = VarImplicitDefinition;
})(L || (L = {}));
var E;
(function (E) {
    class VariableImplicitDefinition extends E.Element {
        constructor(name = 'foo', value = null) {
            super();
            this.c_name = new C.TextField(this, name);
            this.c_value = new C.DropField(this, value);
            this.initialize([
                [new C.Label('var'), this.c_name, new C.Label('='), this.c_value]
            ], E.ElementType.Variable);
        }
        getJSONName() { return 'VariableImplicitDefinition'; }
        constructCode() {
            var logic = new L.VarImplicitDefinition(this.c_name.getRawData(), this.c_value.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new VariableImplicitDefinition(this.c_name.getRawData(), this.c_value.getContentCopy()).copyMetadata(this);
        }
    }
    E.VariableImplicitDefinition = VariableImplicitDefinition;
})(E || (E = {}));
var L;
(function (L) {
    class EmptyElement extends L.LogicElement {
        _compile(environment) {
            return true;
        }
        *execute(environment) {
            return;
        }
    }
    L.EmptyElement = EmptyElement;
})(L || (L = {}));
var L;
(function (L) {
    class AliasDeclaration extends L.IDeclaration {
        constructor(name, log_type) {
            super(name);
            this.name = name;
            this.log_type = log_type;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_type);
            this.cs = this.log_type.compile(environment) && this.cs;
            if (!this.cs)
                false;
            var varType = this.log_type.returns.varType;
            this.errorIfNot(varType instanceof TS.PrototypeType, 'Expected type definition', this.log_type);
            if (!this.cs)
                return false;
            var declarationClass = varType;
            environment.addElement(this.name, declarationClass);
            this.expectsType = new TS.LValueOfType(declarationClass.declaresType());
            return this.cs;
        }
        *createTempValue(environment) {
            throw 'Alias has to be assigned to some value and has none default value';
        }
        *instantiate(environment) {
            environment.addAliasToStack(environment.popTempValue(), this.name);
            return;
        }
    }
    L.AliasDeclaration = AliasDeclaration;
})(L || (L = {}));
var E;
(function (E) {
    class AliasDeclaration extends E.Element {
        constructor(name = 'foo', typ = null, value = null) {
            super();
            this.c_name = new C.TextField(this, name);
            this.c_type = new C.DropField(this, typ);
            this.initialize([
                [
                    new C.Label('alias'),
                    this.c_name,
                    new C.Label(':'),
                    this.c_type,
                ]
            ], E.ElementType.Variable);
        }
        getJSONName() { return 'AliasDeclaration'; }
        constructCode() {
            var logic = new L.AliasDeclaration(this.c_name.getRawData(), this.c_type.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new AliasDeclaration(this.c_name.getRawData(), this.c_type.getContentCopy()).copyMetadata(this);
        }
    }
    E.AliasDeclaration = AliasDeclaration;
})(E || (E = {}));
var L;
(function (L) {
    class AliasDefinition extends L.AliasDeclaration {
        constructor(name, log_type, log_value) {
            super(name, log_type);
            this.log_value = log_value;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_type);
            this.cs = this.log_type.compile(environment) && this.cs;
            this.errorIfEmpty(this.log_value);
            this.cs = this.log_value.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            var typeType = this.log_type.returns.varType;
            this.errorIfNot(typeType instanceof TS.PrototypeType, 'Expected type definition', this.log_type);
            if (!this.cs)
                return false;
            var valType = this.log_value.returns.varType;
            this.errorIfNot(valType instanceof TS.InstanceType, 'Expected object instance', this.log_value);
            if (!this.cs)
                return false;
            var declarationClass = typeType;
            environment.addElement(this.name, declarationClass.declaresType());
            var prototypeType = typeType;
            this.expectsType = new TS.LValueOfType(declarationClass.declaresType());
            this.errorIfTypeMismatch(this.expectsType, this.log_value.returns, this.log_value);
            if (!this.cs)
                return false;
            return this.cs;
        }
        *createTempValue(environment) {
            yield* this.log_value.run(environment);
            return;
        }
    }
    L.AliasDefinition = AliasDefinition;
})(L || (L = {}));
var E;
(function (E) {
    class AliasDefinition extends E.Element {
        constructor(name = 'foo', typ = null, value = null) {
            super();
            this.c_name = new C.TextField(this, name);
            this.c_type = new C.DropField(this, typ);
            this.c_value = new C.DropField(this, value);
            this.initialize([
                [
                    new C.Label('alias'),
                    this.c_name,
                    new C.Label(':'),
                    this.c_type,
                    new C.Label('='),
                    this.c_value
                ]
            ], E.ElementType.Variable);
        }
        getJSONName() { return 'AliasDefinition'; }
        constructCode() {
            var logic = new L.AliasDefinition(this.c_name.getRawData(), this.c_type.constructCode(), this.c_value.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new AliasDefinition(this.c_name.getRawData(), this.c_type.getContentCopy(), this.c_value.getContentCopy()).copyMetadata(this);
        }
    }
    E.AliasDefinition = AliasDefinition;
})(E || (E = {}));
var L;
(function (L) {
    class Any extends L.LogicElement {
        constructor() {
            super();
        }
        _compile(environment) {
            this.returns = new TS.RValueOfType(TS.Int.typeInstance);
            return true;
        }
        *execute(environment) {
            environment.pushTempValue(TS.Int.classInstance);
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.Any = Any;
})(L || (L = {}));
var E;
(function (E) {
    class Any extends E.Element {
        constructor() {
            super();
            this.initialize([
                [new C.Label('any')]
            ], E.ElementType.Type);
        }
        getJSONName() { return 'Any'; }
        constructCode() {
            var logic = new L.Any();
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Any().copyMetadata(this);
        }
    }
    E.Any = Any;
})(E || (E = {}));
var L;
(function (L) {
    class Block extends L.LogicElement {
        constructor(log_list) {
            super();
            this.log_list = log_list;
        }
        _compile(environment) {
            environment.addScope();
            this.compileBlock(environment, this.log_list);
            environment.removeScope();
            if (!this.cs)
                return false;
            return this.cs;
        }
        *execute(environment) {
            environment.addScope('Block');
            yield L.Operation.memory(this);
            yield* L.If.executeBlock(environment, this.log_list);
            var removedScope = environment.removeScope();
            yield L.Operation.memory(this);
            return;
        }
    }
    L.Block = Block;
})(L || (L = {}));
var E;
(function (E) {
    class Block extends E.Element {
        constructor(list = []) {
            super();
            this.c_list = new C.DropList(this, list);
            this.initialize([
                [
                    new C.Label('{'),
                ],
                [
                    this.c_list,
                ],
                [
                    new C.Label('}'),
                ]
            ], E.ElementType.Flow);
        }
        getJSONName() { return 'Block'; }
        constructCode() {
            var logic = new L.Block(this.c_list.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Block(this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
    E.Block = Block;
})(E || (E = {}));
var L;
(function (L) {
    class Bool extends L.LogicElement {
        constructor() {
            super();
        }
        _compile(environment) {
            this.returns = new TS.RValueOfType(TS.Boolean.typeInstance);
            return true;
        }
        *execute(environment) {
            environment.pushTempValue(TS.Boolean.classInstance);
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.Bool = Bool;
})(L || (L = {}));
var E;
(function (E) {
    class Bool extends E.Element {
        constructor() {
            super();
            this.initialize([
                [new C.Label('bool')]
            ], E.ElementType.Type);
        }
        getJSONName() { return 'Bool'; }
        constructCode() {
            var logic = new L.Bool();
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Bool().copyMetadata(this);
        }
    }
    E.Bool = Bool;
})(E || (E = {}));
var L;
(function (L) {
    class Break extends L.LogicElement {
        constructor() {
            super();
        }
        _compile(environment) {
            this.errorIfNot(environment.isInContext(Compiler.Context.Loop), 'You can use "break" keyword only inside a loop');
            this.flowState = Compiler.FlowState.Break;
            return this.cs;
        }
        *execute(environment) {
            environment.flowState = Memory.FlowState.Break;
            yield L.Operation.flow(this);
            return;
        }
    }
    L.Break = Break;
})(L || (L = {}));
var E;
(function (E) {
    class Break extends E.Element {
        constructor(mesage = null) {
            super();
            this.initialize([
                [
                    new C.Label('break'),
                ]
            ], E.ElementType.Flow);
        }
        getJSONName() { return 'Break'; }
        constructCode() {
            var logic = new L.Break();
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Break().copyMetadata(this);
        }
    }
    E.Break = Break;
})(E || (E = {}));
var L;
(function (L) {
    var O = L.Operation;
    class ClassDefinition extends L.LogicElement {
        constructor(name, log_extends, log_list) {
            super();
            this.name = name;
            this.log_extends = log_extends;
            this.log_list = log_list;
            this.functionClosures = {};
        }
        _compile(environment) {
            var fields = {};
            var functions = {};
            this.prototype = new TS.ClassType(fields, functions, this.name);
            this.errorIfEmpty(this.log_extends);
            this.cs = this.log_extends.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.extendsType = this.log_extends.returns.varType;
            this.errorIfNot(this.extendsType instanceof TS.PrototypeType, 'You can extend only other classes', this.log_extends);
            if (!this.cs)
                return false;
            environment.addElement(this.name, this.prototype);
            environment.addScope();
            environment.addClosure();
            for (var i = 0; i < this.log_list.length; i++) {
                var logElement = this.log_list[i];
                if (logElement instanceof L.EmptyElement) {
                    continue;
                }
                else if (logElement instanceof L.Function) {
                    var fun = logElement;
                    environment.addScope();
                    this.cs = fun.compileType(environment) && this.cs;
                    environment.removeScope();
                    if (!!functions[fun.name] || !!fields[fun.name])
                        this.error('Member of this name already exists (functions overloading is not supported yet)', logElement);
                    if (!fun.cs)
                        continue;
                    functions[fun.name] = fun.functionType;
                }
                else if (this.log_list[i] instanceof L.VarDefinition) {
                    var field = logElement;
                    environment.addScope();
                    this.cs = field.compile(environment) && this.cs;
                    environment.removeScope();
                    if (!!functions[field.name] || !!fields[field.name])
                        this.error('Member of this name already exists (functions overloading is not supported yet)', logElement);
                    if (!field.cs)
                        continue;
                    fields[field.name] = new TS.ClassFieldType(field.name, field.expectsType.varType);
                }
                else {
                    this.error('Expected field or method declaration', logElement);
                    continue;
                }
            }
            environment.removeClosure();
            environment.removeScope();
            if (!this.cs)
                return false;
            environment.addScope();
            environment.addClosure();
            for (var i = 0; i < this.log_list.length; i++) {
                if (this.log_list[i] instanceof L.Function) {
                    var fun = this.log_list[i];
                    environment.addScope();
                    environment.addClosure();
                    environment.addElement('this', this.prototype.declaresType());
                    this.cs = fun.compile(environment) && this.cs;
                    this.functionClosures[fun.name] = environment.removeClosure();
                    environment.removeScope();
                    if (!this.cs)
                        continue;
                }
            }
            environment.removeClosure();
            environment.removeScope();
            if (!this.cs)
                return false;
            this.returns = new TS.RValueOfType(this.prototype);
            return this.cs;
        }
        *execute(environment) {
            var fields = {};
            var functions = {};
            var newClass = new TS.Class(this.prototype, fields, functions);
            environment.addValueToStack(newClass, this.name);
            yield L.Operation.memory(this);
            for (var i = 0; i < this.log_list.length; i++) {
                if (this.log_list[i] instanceof L.VarDefinition) {
                    var field = this.log_list[i];
                    fields[field.name] = new TS.ClassField(field, field.name);
                }
                if (this.log_list[i] instanceof L.Function) {
                    var fun = this.log_list[i];
                    var closure = this.functionClosures[fun.name];
                    functions[fun.name] = fun.createFunctionObject(environment, closure);
                }
            }
            return;
        }
    }
    L.ClassDefinition = ClassDefinition;
})(L || (L = {}));
var E;
(function (E) {
    class ClassDefinition extends E.Element {
        constructor(name = 'foo', extend = null, list = []) {
            super();
            this.c_name = new C.TextField(this, name),
                this.c_extends = new C.DropField(this, extend),
                this.c_list = new C.DropList(this, list);
            this.initialize([
                [
                    new C.Label('class'),
                    this.c_name,
                    new C.Label('extends'),
                    this.c_extends,
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
            ], E.ElementType.Type);
        }
        getJSONName() { return 'ClassDefinition'; }
        constructCode() {
            var logic = new L.ClassDefinition(this.c_name.getRawData(), this.c_extends.constructCode(), this.c_list.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new ClassDefinition(this.c_name.getRawData(), this.c_extends.getContentCopy(), this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
    E.ClassDefinition = ClassDefinition;
})(E || (E = {}));
var L;
(function (L) {
    class BaseClassDefinition extends L.ClassDefinition {
    }
    L.BaseClassDefinition = BaseClassDefinition;
})(L || (L = {}));
var E;
(function (E) {
    class BaseClassDefinition extends E.Element {
        constructor(name = 'foo', list = []) {
            super();
            this.c_name = new C.TextField(this, name),
                this.c_list = new C.DropList(this, list);
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
            ], E.ElementType.Type);
        }
        getJSONName() { return 'BaseClassDefinition'; }
        constructCode() {
            var logic = new L.BaseClassDefinition(this.c_name.getRawData(), new L.Any(), this.c_list.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new BaseClassDefinition(this.c_name.getRawData(), this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
    E.BaseClassDefinition = BaseClassDefinition;
})(E || (E = {}));
var E;
(function (E) {
    class Comment extends E.Element {
        constructor(value = 'foo') {
            super();
            this.c_data = new C.TextField(this, value);
            this.initialize([
                [new C.Label('//'), this.c_data]
            ], E.ElementType.Other);
        }
        getJSONName() { return 'Comment'; }
        constructCode() {
            var emptyElement = new L.EmptyElement();
            emptyElement.setObserver(this);
            return emptyElement;
        }
        getCopy() {
            return new Comment(this.c_data.getRawData()).copyMetadata(this);
        }
    }
    E.Comment = Comment;
})(E || (E = {}));
var E;
(function (E) {
    class MultilineComment extends E.Element {
        constructor(list = []) {
            super();
            this.c_list = new C.DropList(this, list);
            this.initialize([
                [new C.Label('/*')],
                [this.c_list],
                [new C.Label('*/')]
            ], E.ElementType.Other);
        }
        getJSONName() { return 'MultilineComment'; }
        constructCode() {
            var emptyElement = new L.EmptyElement();
            emptyElement.setObserver(this);
            return emptyElement;
        }
        getCopy() {
            return new MultilineComment(this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
    E.MultilineComment = MultilineComment;
})(E || (E = {}));
var L;
(function (L) {
    class Continue extends L.LogicElement {
        constructor() {
            super();
        }
        _compile(environment) {
            this.errorIfNot(environment.isInContext(Compiler.Context.Loop), 'You can use "continue" keyword only inside a loop');
            this.flowState = Compiler.FlowState.Break;
            return this.cs;
        }
        *execute(environment) {
            environment.flowState = Memory.FlowState.Continue;
            yield L.Operation.flow(this);
            return;
        }
    }
    L.Continue = Continue;
})(L || (L = {}));
var E;
(function (E) {
    class Continue extends E.Element {
        constructor(mesage = null) {
            super();
            this.initialize([
                [
                    new C.Label('continue'),
                ]
            ], E.ElementType.Flow);
        }
        getJSONName() { return 'Continue'; }
        constructCode() {
            var logic = new L.Continue();
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Continue().copyMetadata(this);
        }
    }
    E.Continue = Continue;
})(E || (E = {}));
var L;
(function (L) {
    class DefaultValue extends L.LogicElement {
        constructor(log_type) {
            super();
            this.log_type = log_type;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_type);
            this.cs = this.log_type.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
            if (!this.cs)
                return false;
            var elemesType = this.log_type.returns.varType;
            this.returns = new TS.RValueOfType(elemesType.declaresType());
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_type.run(environment);
            var elemType = environment.popTempValue().getValue();
            var object = elemType.defaultValue();
            yield* object.construct(environment);
            environment.pushTempValue(object);
            return;
        }
    }
    L.DefaultValue = DefaultValue;
})(L || (L = {}));
var E;
(function (E) {
    class DefaultValue extends E.Element {
        constructor(typ = null) {
            super();
            this.c_type = new C.DropField(this, typ),
                this.initialize([
                    [
                        new C.Label('default value'),
                        this.c_type,
                    ],
                ], E.ElementType.Value);
        }
        getJSONName() { return 'DefaultValue'; }
        constructCode() {
            var logic = new L.DefaultValue(this.c_type.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new DefaultValue(this.c_type.getContentCopy()).copyMetadata(this);
        }
    }
    E.DefaultValue = DefaultValue;
})(E || (E = {}));
var L;
(function (L) {
    class ElementAt extends L.LogicElement {
        constructor(log_array, log_index) {
            super();
            this.log_array = log_array;
            this.log_index = log_index;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_array);
            this.errorIfEmpty(this.log_index);
            this.cs = this.log_array.compile(environment) && this.cs;
            this.cs = this.log_index.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.errorIfNotInstance(this.log_index.returnsType(), this.log_index);
            if (!this.cs)
                return false;
            var leftType = this.log_array.returnsType();
            while (leftType instanceof TS.ReferenceType)
                leftType = leftType.prototypeType.referencedPrototypeType.declaresType();
            var arrayInstance = leftType;
            var indexInstance = this.log_index.returnsType();
            this.errorIfNot(arrayInstance instanceof TS.ArrayType, 'Expected array', this.log_array);
            if (!this.cs)
                return false;
            var arrayType = arrayInstance.prototypeType;
            this.returns = new TS.LValueOfType(arrayType.elementsClass.declaresType());
            return true;
        }
        *execute(environment) {
            yield* this.log_index.run(environment);
            yield* this.log_array.run(environment);
            var tempMemoryField = environment.popTempValue();
            var index = environment.popTempValue().getValue().rawValue;
            while (tempMemoryField.getValue() instanceof TS.Reference)
                tempMemoryField = tempMemoryField.getValue().reference;
            var leftObject = tempMemoryField.getValue();
            var object = leftObject;
            var arrayField = object.getField(index);
            environment.pushTempAlias(arrayField);
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.ElementAt = ElementAt;
})(L || (L = {}));
var E;
(function (E) {
    class ElementAt extends E.Element {
        constructor(array = null, index = null) {
            super();
            this.c_array = new C.DropField(this, array),
                this.c_index = new C.DropField(this, index),
                this.initialize([
                    [
                        this.c_array,
                        new C.Label('['),
                        this.c_index,
                        new C.Label(']'),
                    ],
                ], E.ElementType.Value);
        }
        getJSONName() { return 'ElementAt'; }
        constructCode() {
            var logic = new L.ElementAt(this.c_array.constructCode(), this.c_index.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new ElementAt(this.c_array.getContentCopy(), this.c_index.getContentCopy()).copyMetadata(this);
        }
    }
    E.ElementAt = ElementAt;
})(E || (E = {}));
var L;
(function (L) {
    class False extends L.LogicElement {
        constructor() {
            super();
        }
        _compile(environment) {
            this.returns = new TS.RValueOfType(new TS.ClassObjectType(TS.Boolean.typeInstance));
            return true;
        }
        *execute(environment) {
            environment.pushTempValue(TS.Boolean.classInstance.getObjectOfValue(false));
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.False = False;
})(L || (L = {}));
var E;
(function (E) {
    class False extends E.Element {
        constructor() {
            super();
            this.c_name = new C.Label('false');
            this.initialize([
                [this.c_name]
            ], E.ElementType.Value);
        }
        getJSONName() { return 'False'; }
        constructCode() {
            var logic = new L.False();
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new False().copyMetadata(this);
        }
    }
    E.False = False;
})(E || (E = {}));
var L;
(function (L) {
    class ForLoop extends L.LogicElement {
        constructor(log_init, log_condition, log_operation, log_list) {
            super();
            this.log_init = log_init;
            this.log_condition = log_condition;
            this.log_operation = log_operation;
            this.log_list = log_list;
            log_init.setAsInternalOperation();
            log_condition.setAsInternalOperation();
            log_operation.setAsInternalOperation();
        }
        _compile(environment) {
            environment.addScope();
            this.cs = this.log_init.compile(environment) && this.cs;
            this.cs = this.log_condition.compile(environment) && this.cs;
            this.cs = this.log_operation.compile(environment) && this.cs;
            environment.addContext(Compiler.Context.Loop);
            this.compileBlock(environment, this.log_list);
            environment.removeContext();
            environment.removeScope();
            if (!this.cs)
                return false;
            this.errorIfTypeMismatch(TS.rValue(TS.Boolean.objectTypeInstance), this.log_condition.returns, this.log_condition);
            return this.cs;
        }
        *execute(environment) {
            environment.addScope('For loop');
            yield L.Operation.memory(this);
            yield* this.log_init.run(environment);
            yield L.Operation.flow(this.log_init);
            environment.clearCurrentTempScope();
            while (true) {
                yield* this.log_condition.run(environment);
                yield L.Operation.flow(this.log_condition);
                var condition = environment.popTempValue().getValue();
                environment.clearCurrentTempScope();
                if (!condition.rawValue)
                    break;
                environment.addScope('For loop body');
                yield* ForLoop.executeBlock(environment, this.log_list);
                var removedScope = environment.removeScope();
                if (environment.flowState == Memory.FlowState.Break) {
                    environment.flowState = Memory.FlowState.NormalFlow;
                    environment.clearCurrentTempScope();
                    break;
                }
                if (environment.flowState == Memory.FlowState.Return) {
                    break;
                }
                else {
                    environment.flowState = Memory.FlowState.NormalFlow;
                }
                yield* this.log_operation.run(environment);
                yield L.Operation.flow(this.log_operation);
                environment.clearCurrentTempScope();
            }
            var removedScope = environment.removeScope();
            return;
        }
    }
    L.ForLoop = ForLoop;
})(L || (L = {}));
var E;
(function (E) {
    class ForLoop extends E.Element {
        constructor(init = null, cond = null, oper = null, list = []) {
            super();
            this.c_init = new C.DropField(this, init);
            this.c_condition = new C.DropField(this, cond);
            this.c_operation = new C.DropField(this, oper);
            this.c_list = new C.DropList(this, list);
            this.initialize([
                [
                    new C.Label('for ('),
                    this.c_init,
                    new C.Label('; '),
                    this.c_condition,
                    new C.Label('; '),
                    this.c_operation,
                    new C.Label(')'),
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
            ], E.ElementType.Flow);
        }
        getJSONName() { return 'ForLoop'; }
        constructCode() {
            var logic = new L.ForLoop(this.c_init.constructCode(), this.c_condition.constructCode(), this.c_operation.constructCode(), this.c_list.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new ForLoop(this.c_init.getContentCopy(), this.c_condition.getContentCopy(), this.c_operation.getContentCopy(), this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
    E.ForLoop = ForLoop;
})(E || (E = {}));
var L;
(function (L) {
    class Function extends L.LogicElement {
        constructor(name, log_arguments, log_return, log_list) {
            super();
            this.name = name;
            this.log_arguments = log_arguments;
            this.log_return = log_return;
            this.log_list = log_list;
            this.typeCompiled = false;
        }
        compileType(environment) {
            if (this.typeCompiled)
                return this.cs;
            else
                this.typeCompiled = true;
            this.parameters = [];
            this.declarations = [];
            this.errorIfEmpty(this.log_return);
            this.cs = this.log_return.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            var returnType = this.log_return.returns.varType.declaresType();
            var usedNames = {};
            for (var i = 0; i < this.log_arguments.length; i++) {
                if (this.log_arguments[i] instanceof L.EmptyElement)
                    continue;
                this.errorIfNot(this.log_arguments[i] instanceof L.IDeclaration, 'Expected parameter declaration', this.log_arguments[i]);
                if (!this.cs)
                    continue;
                var declaration = this.log_arguments[i];
                environment.addScope();
                this.cs = declaration.compile(environment) && this.cs;
                environment.removeScope();
                if (!!usedNames[declaration.name]) {
                    this.error("Parameter of this name already exists", declaration);
                    continue;
                }
                usedNames[declaration.name] = true;
                if (!declaration.cs)
                    continue;
                var parameter = new TS.FunctionParapeterType(declaration.name, declaration.expectsType, declaration instanceof L.IDeclaration);
                this.parameters[this.parameters.length] = parameter;
                this.declarations[this.declarations.length] = declaration;
            }
            if (!this.cs)
                return false;
            this.functionType = new TS.FunctionClassType(this.parameters, TS.rValue(returnType));
            return this.cs;
        }
        _compile(environment) {
            environment.addScope();
            environment.addClosure();
            this.compileType(environment);
            for (var i = 0; i < this.declarations.length; i++) {
                var declaration = this.declarations[i];
                environment.addElement(declaration.name, declaration.expectsType.varType);
            }
            environment.addElement(this.name, new TS.FunctionType(this.functionType));
            var returnsType = this.functionType.returnType.varType;
            environment.addContext(Compiler.Context.Function);
            environment.addFunctionExpection(this.functionType.returnType.varType);
            var flowState = this.compileBlock(environment, this.log_list);
            this.errorIf(flowState != Compiler.FlowState.Return && !(returnsType instanceof TS.InstanceType && returnsType.prototypeType == TS.Void.typeInstance), 'Not all code paths return a value', this.log_return);
            environment.removeFunctionExpection();
            environment.removeContext();
            this.closure = environment.removeClosure();
            environment.removeScope();
            if (!this.cs)
                return false;
            environment.addElement(this.name, new TS.FunctionType(this.functionType));
            return this.cs;
        }
        *execute(environment) {
            var fun = this.createFunctionObject(environment, this.closure);
            environment.addValueToStack(fun, this.name);
            fun.closure.push(new TS.EnclosedValue(this.name, fun.getCopy()));
            yield L.Operation.memory(this);
            return;
        }
        createFunctionObject(environment, closure) {
            var logicElement = this;
            this.enclosedValues = [];
            for (var key in closure) {
                this.enclosedValues.push(new TS.EnclosedValue(key, environment.getFromStack(key).getValue().getCopy()));
            }
            var declarations = [];
            var fun = new TS.FunctionObject(new TS.FunctionClass(), this.declarations, function* (environment) {
                for (var i = 0; i < logicElement.log_list.length; i++) {
                    yield* logicElement.log_list[i].run(environment);
                    if (environment.flowState == Memory.FlowState.Return) {
                        var value = environment.popTempValue().getValue();
                        environment.clearCurrentTempScope();
                        environment.pushTempValue(value);
                        environment.flowState = Memory.FlowState.NormalFlow;
                        return;
                    }
                    else {
                        environment.clearCurrentTempScope();
                    }
                }
                return new TS.Obj();
            }, this.enclosedValues);
            return fun;
        }
    }
    L.Function = Function;
})(L || (L = {}));
var E;
(function (E) {
    class Function extends E.Element {
        constructor(name = 'foo', args = [], returns = null, list = []) {
            super();
            this.c_name = new C.TextField(this, name);
            this.c_arguments = new C.DropList(this, args);
            this.c_return = new C.DropField(this, returns);
            this.c_list = new C.DropList(this, list);
            this.initialize([
                [
                    this.c_name,
                    new C.Label('('),
                    this.c_arguments,
                    new C.Label('):'),
                    this.c_return,
                ],
                [
                    new C.Label('{'),],
                [
                    this.c_list,
                ],
                [
                    new C.Label('}'),
                ]
            ], E.ElementType.Function);
        }
        getJSONName() { return 'Function'; }
        constructCode() {
            var logic = new L.Function(this.c_name.getRawData(), this.c_arguments.getLogicComponents(), this.c_return.constructCode(), this.c_list.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Function(this.c_name.getRawData(), this.c_arguments.getContentCopy(), this.c_return.getContentCopy(), this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
    E.Function = Function;
})(E || (E = {}));
var L;
(function (L) {
    class FunctionCall extends L.LogicElement {
        constructor(log_name, log_arguments) {
            super();
            this.log_name = log_name;
            this.log_arguments = log_arguments;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_name);
            this.cs = this.log_name.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.errorIfNot(this.log_name.returns.varType instanceof TS.FunctionType, 'Expected function', this.log_name);
            if (!this.cs)
                return false;
            var fun = this.log_name.returns.varType;
            var funType = fun.prototypeType;
            var passedArguments = [];
            for (var i = 0; i < this.log_arguments.length; i++) {
                var argument = this.log_arguments[i];
                this.cs = argument.compile(environment) && this.cs;
                if (argument instanceof L.EmptyElement)
                    continue;
                if (!argument.cs)
                    continue;
                this.errorIfTypeMismatch(funType.parameters[passedArguments.length].paramType, argument.returns, argument);
                passedArguments.push(argument);
            }
            this.errorIf(passedArguments.length != funType.parameters.length, 'Number of paramteres and number of anguments do not match');
            if (!this.cs)
                return false;
            this.returns = funType.returnType;
            return this.cs;
        }
        *execute(environment) {
            var passedArguments = 0;
            for (var i = this.log_arguments.length - 1; i >= 0; i--) {
                if (this.log_arguments[i] instanceof L.EmptyElement)
                    continue;
                yield* this.log_arguments[i].run(environment);
                passedArguments++;
            }
            yield* this.log_name.run(environment);
            var fun = environment.popTempValue().getValue();
            yield L.Operation.flow(this);
            yield* fun.call(environment, passedArguments);
            return;
        }
    }
    L.FunctionCall = FunctionCall;
})(L || (L = {}));
var E;
(function (E) {
    class FunctionCall extends E.Element {
        constructor(neme = null, args = []) {
            super();
            this.c_name = new C.DropField(this, neme),
                this.c_arguments = new C.DropList(this, args);
            this.initialize([
                [
                    this.c_name,
                    new C.Label('('),
                    this.c_arguments,
                    new C.Label(')'),
                ],
            ], E.ElementType.Function);
        }
        getJSONName() { return 'FunctionCall'; }
        constructCode() {
            var logic = new L.FunctionCall(this.c_name.constructCode(), this.c_arguments.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new FunctionCall(this.c_name.getContentCopy(), this.c_arguments.getContentCopy()).copyMetadata(this);
        }
    }
    E.FunctionCall = FunctionCall;
})(E || (E = {}));
var L;
(function (L) {
    class If extends L.LogicElement {
        constructor(log_condition, log_list) {
            super();
            this.log_condition = log_condition;
            this.log_list = log_list;
            log_condition.setAsInternalOperation();
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_condition);
            environment.addScope();
            this.cs = this.log_condition.compile(environment) && this.cs;
            this.compileBlock(environment, this.log_list);
            environment.removeScope();
            if (!this.cs)
                return false;
            this.errorIfTypeMismatch(TS.rValue(TS.Boolean.objectTypeInstance), this.log_condition.returns, this.log_condition);
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_condition.run(environment);
            yield L.Operation.flow(this.log_condition);
            var condition = environment.popTempValue().getValue();
            if (condition.rawValue) {
                environment.addScope('If body');
                yield L.Operation.memory(this);
                yield* If.executeBlock(environment, this.log_list);
                var removedScope = environment.removeScope();
                yield L.Operation.memory(this);
            }
            return;
        }
    }
    L.If = If;
})(L || (L = {}));
var E;
(function (E) {
    class If extends E.Element {
        constructor(cond = null, list = []) {
            super();
            this.c_condition = new C.DropField(this, cond);
            this.c_list = new C.DropList(this, list);
            this.initialize([
                [
                    new C.Label('if ('),
                    this.c_condition,
                    new C.Label(')'),
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
            ], E.ElementType.Flow);
        }
        getJSONName() { return 'If'; }
        constructCode() {
            var logic = new L.If(this.c_condition.constructCode(), this.c_list.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new If(this.c_condition.getContentCopy(), this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
    E.If = If;
})(E || (E = {}));
var L;
(function (L) {
    class IfElse extends L.LogicElement {
        constructor(log_condition, log_listTrue, log_listFalse) {
            super();
            this.log_condition = log_condition;
            this.log_listTrue = log_listTrue;
            this.log_listFalse = log_listFalse;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_condition);
            environment.addScope();
            this.cs = this.log_condition.compile(environment) && this.cs;
            environment.addScope();
            var flowState1 = this.compileBlock(environment, this.log_listTrue);
            environment.removeScope();
            environment.addScope();
            var flowState2 = this.compileBlock(environment, this.log_listFalse);
            environment.removeScope();
            this.flowState = Math.min(flowState1, flowState2);
            environment.removeScope();
            if (!this.cs)
                return false;
            this.errorIfTypeMismatch(TS.rValue(TS.Boolean.objectTypeInstance), this.log_condition.returns, this.log_condition);
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_condition.run(environment);
            var condition = environment.popTempValue().getValue();
            yield L.Operation.flow(this);
            if (condition.rawValue) {
                environment.addScope('If body');
                yield L.Operation.memory(this);
                yield* IfElse.executeBlock(environment, this.log_listTrue);
                var removedScope = environment.removeScope();
                yield L.Operation.memory(this);
            }
            else {
                environment.addScope('Else body');
                yield L.Operation.memory(this);
                yield* IfElse.executeBlock(environment, this.log_listFalse);
                var removedScope = environment.removeScope();
                yield L.Operation.memory(this);
            }
            return;
        }
    }
    L.IfElse = IfElse;
})(L || (L = {}));
var E;
(function (E) {
    class IfElse extends E.Element {
        constructor(cond = null, listTrue = [], listFalse = []) {
            super();
            this.c_condition = new C.DropField(this, cond);
            this.c_listTrue = new C.DropList(this, listTrue);
            this.c_listFalse = new C.DropList(this, listFalse);
            this.initialize([
                [
                    new C.Label('if ('),
                    this.c_condition,
                    new C.Label(')'),
                ],
                [
                    new C.Label('{'),
                ],
                [
                    this.c_listTrue,
                ],
                [
                    new C.Label('}'),
                ],
                [
                    new C.Label('else'),
                ],
                [
                    new C.Label('{'),
                ],
                [
                    this.c_listFalse,
                ],
                [
                    new C.Label('}'),
                ]
            ], E.ElementType.Flow);
        }
        getJSONName() { return 'IfElse'; }
        constructCode() {
            var logic = new L.IfElse(this.c_condition.constructCode(), this.c_listTrue.getLogicComponents(), this.c_listFalse.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new IfElse(this.c_condition.getContentCopy(), this.c_listTrue.getContentCopy(), this.c_listFalse.getContentCopy()).copyMetadata(this);
        }
    }
    E.IfElse = IfElse;
})(E || (E = {}));
var L;
(function (L) {
    class Int extends L.LogicElement {
        constructor() {
            super();
        }
        _compile(environment) {
            this.returns = new TS.RValueOfType(TS.Int.typeInstance);
            return true;
        }
        *execute(environment) {
            environment.pushTempValue(TS.Int.classInstance);
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.Int = Int;
})(L || (L = {}));
var E;
(function (E) {
    class Int extends E.Element {
        constructor() {
            super();
            this.initialize([
                [new C.Label('number')]
            ], E.ElementType.Type);
        }
        getJSONName() { return 'Int'; }
        constructCode() {
            var logic = new L.Int();
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Int().copyMetadata(this);
        }
    }
    E.Int = Int;
})(E || (E = {}));
var L;
(function (L) {
    class Operator1 extends L.LogicElement {
        constructor(operation, log_operand, hadSideEffects) {
            super();
            this.operation = operation;
            this.log_operand = log_operand;
            this.hadSideEffects = hadSideEffects;
            this.logicFunction =
                new L.FunctionCall(new L.Path(this.log_operand, this.operation).setAsInternalOperation(), []).setAsInternalOperation();
        }
        _compile(environment) {
            this.cs = this.logicFunction.compile(environment) && this.cs;
            this.errorIfEmpty(this.log_operand);
            if (this.log_operand.cs)
                this.errorIfNot(this.cs, 'These two values cannot be aplied to this operator');
            if (!this.cs)
                return false;
            this.returns = this.logicFunction.returns;
            return this.cs;
        }
        *execute(environment) {
            yield* this.logicFunction.run(environment);
            environment.passTempValue();
            if (this.hadSideEffects)
                yield L.Operation.memory(this);
            else
                yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.Operator1 = Operator1;
})(L || (L = {}));
var E;
(function (E) {
    class Operator1 extends E.Element {
        constructor(elemType, operator, post, left = null, sideEffects = false) {
            super();
            this.c_operand = new C.DropField(this, left),
                this.initialize(post ?
                    [[this.c_operand, new C.Label(operator)]] :
                    [[new C.Label(operator), this.c_operand]], E.ElementType.Math);
            this.elemType = elemType;
            this.operator = post ? '_' + operator : operator;
            this.hadSideEffects = sideEffects;
        }
        constructCode() {
            var logic = new L.Operator1(this.operator, this.c_operand.constructCode(), this.hadSideEffects);
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new this.elemType(this.c_operand.getContentCopy()).copyMetadata(this);
        }
    }
    class Increment extends Operator1 {
        constructor(a = null) {
            super(Increment, '++', false, a, true);
        }
        getJSONName() { return 'Increment'; }
    }
    E.Increment = Increment;
    class Decrement extends Operator1 {
        constructor(a = null) {
            super(Decrement, '--', false, a, true);
        }
        getJSONName() { return 'Decrement'; }
    }
    E.Decrement = Decrement;
    class PostIncrement extends Operator1 {
        constructor(a = null) {
            super(PostIncrement, '++', true, a, true);
        }
        getJSONName() { return 'PostIncrement'; }
    }
    E.PostIncrement = PostIncrement;
    class PostDecrement extends Operator1 {
        constructor(a = null) {
            super(PostDecrement, '--', true, a, true);
        }
        getJSONName() { return 'PostDecrement'; }
    }
    E.PostDecrement = PostDecrement;
    class Print extends Operator1 {
        constructor(a = null) {
            super(Print, 'print', false, a, true);
        }
        getJSONName() { return 'Print'; }
    }
    E.Print = Print;
    class Scan extends Operator1 {
        constructor(a = null) {
            super(Scan, 'scan', false, a, true);
        }
        getJSONName() { return 'Scan'; }
    }
    E.Scan = Scan;
    class Not extends Operator1 {
        constructor(a = null) {
            super(Not, '!', false, a);
        }
        getJSONName() { return 'Not'; }
    }
    E.Not = Not;
})(E || (E = {}));
var L;
(function (L) {
    class Operator2 extends L.LogicElement {
        constructor(operation, log_left, log_right) {
            super();
            this.operation = operation;
            this.log_left = log_left;
            this.log_right = log_right;
            this.logicFunction =
                new L.FunctionCall(new L.Path(this.log_left, this.operation).setAsInternalOperation(), [this.log_right]).setAsInternalOperation();
        }
        _compile(environment) {
            this.cs = this.logicFunction.compile(environment) && this.cs;
            this.errorIfEmpty(this.log_left);
            this.errorIfEmpty(this.log_right);
            if (this.log_left.cs && this.log_right.cs)
                this.errorIfNot(this.cs, 'These two values cannot be aplied to this operator');
            if (!this.cs)
                return false;
            this.returns = this.logicFunction.returns;
            return this.cs;
        }
        *execute(environment) {
            yield* this.logicFunction.run(environment);
            environment.passTempValue();
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.Operator2 = Operator2;
})(L || (L = {}));
var E;
(function (E) {
    class Operator2 extends E.Element {
        constructor(elemType, operator, left = null, right = null) {
            super();
            this.c_left = new C.DropField(this, left),
                this.c_right = new C.DropField(this, right);
            this.initialize([
                [
                    this.c_left,
                    new C.Label(operator),
                    this.c_right
                ]
            ], E.ElementType.Math);
            this.elemType = elemType;
            this.operator = operator;
        }
        constructCode() {
            var logic = new L.Operator2(this.operator, this.c_left.constructCode(), this.c_right.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new this.elemType(this.c_left.getContentCopy(), this.c_right.getContentCopy()).copyMetadata(this);
        }
    }
    class Add extends Operator2 {
        constructor(a = null, b = null) {
            super(Add, '+', a, b);
        }
        getJSONName() { return 'Add'; }
    }
    E.Add = Add;
    class Substract extends Operator2 {
        constructor(a = null, b = null) {
            super(Substract, '-', a, b);
        }
        getJSONName() { return 'Substract'; }
    }
    E.Substract = Substract;
    class Multiply extends Operator2 {
        constructor(a = null, b = null) {
            super(Multiply, '*', a, b);
        }
        getJSONName() { return 'Multiply'; }
    }
    E.Multiply = Multiply;
    class Divide extends Operator2 {
        constructor(a = null, b = null) {
            super(Divide, '/', a, b);
        }
        getJSONName() { return 'Divide'; }
    }
    E.Divide = Divide;
    class Equal extends Operator2 {
        constructor(a = null, b = null) {
            super(Equal, '==', a, b);
        }
        getJSONName() { return 'Equal'; }
    }
    E.Equal = Equal;
    class NotEqual extends Operator2 {
        constructor(a = null, b = null) {
            super(NotEqual, '!=', a, b);
        }
        getJSONName() { return 'NotEqual'; }
    }
    E.NotEqual = NotEqual;
    class Less extends Operator2 {
        constructor(a = null, b = null) {
            super(Less, '<', a, b);
        }
        getJSONName() { return 'Less'; }
    }
    E.Less = Less;
    class LessEqual extends Operator2 {
        constructor(a = null, b = null) {
            super(LessEqual, '<=', a, b);
        }
        getJSONName() { return 'LessEqual'; }
    }
    E.LessEqual = LessEqual;
    class More extends Operator2 {
        constructor(a = null, b = null) {
            super(More, '>', a, b);
        }
        getJSONName() { return 'More'; }
    }
    E.More = More;
    class MoreEqual extends Operator2 {
        constructor(a = null, b = null) {
            super(MoreEqual, '>=', a, b);
        }
        getJSONName() { return 'MoreEqual'; }
    }
    E.MoreEqual = MoreEqual;
    class Modulo extends Operator2 {
        constructor(a = null, b = null) {
            super(Modulo, '%', a, b);
        }
        getJSONName() { return 'Modulo'; }
    }
    E.Modulo = Modulo;
    class And extends Operator2 {
        constructor(a = null, b = null) {
            super(And, '&&', a, b);
        }
        getJSONName() { return 'And'; }
    }
    E.And = And;
    class Or extends Operator2 {
        constructor(a = null, b = null) {
            super(Or, '||', a, b);
        }
        getJSONName() { return 'Or'; }
    }
    E.Or = Or;
})(E || (E = {}));
var L;
(function (L) {
    class NewArrayObject extends L.LogicElement {
        constructor(log_type, log_size) {
            super();
            this.log_type = log_type;
            this.log_size = log_size;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_type);
            this.errorIfEmpty(this.log_size);
            this.cs = this.log_type.compile(environment) && this.cs;
            this.cs = this.log_size.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.errorIfNotInstance(this.log_size.returnsType(), this.log_size);
            this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
            if (!this.cs)
                return false;
            var prototype = this.log_type.returnsType();
            var arrayType = new TS.ArrayClassType(prototype);
            this.returns = new TS.RValueOfType(new TS.ReferenceType(new TS.ReferenceClassType(arrayType)));
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_size.run(environment);
            yield* this.log_type.run(environment);
            var elemType = environment.popTempValue().getValue();
            var length = environment.popTempValue().getValue().rawValue;
            var arrayClass = new TS.ArrayClass(elemType, length);
            var object = arrayClass.defaultValue();
            yield* object.construct(environment);
            var heapField = environment.addToHeap(object);
            environment.pushTempValue(new TS.Reference(new TS.ReferenceClass(arrayClass), heapField));
            return;
        }
    }
    L.NewArrayObject = NewArrayObject;
})(L || (L = {}));
var E;
(function (E) {
    class NewArray extends E.Element {
        constructor(typ = null, size = null) {
            super();
            this.c_type = new C.DropField(this, typ),
                this.c_size = new C.DropField(this, size);
            this.initialize([
                [
                    new C.Label('new'),
                    this.c_type,
                    new C.Label('['),
                    this.c_size,
                    new C.Label(']'),
                ],
            ], E.ElementType.Value);
        }
        getJSONName() { return 'NewArray'; }
        constructCode() {
            var logic = new L.NewArrayObject(this.c_type.constructCode(), this.c_size.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new NewArray(this.c_type.getContentCopy(), this.c_size.getContentCopy()).copyMetadata(this);
        }
    }
    E.NewArray = NewArray;
})(E || (E = {}));
var L;
(function (L) {
    class NewHeapObject extends L.LogicElement {
        constructor(log_type, log_arguments) {
            super();
            this.log_type = log_type;
            this.log_arguments = log_arguments;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_type);
            this.cs = this.log_type.compile(environment) && this.cs;
            var passedValues = [];
            for (var i = 0; i < this.log_arguments.length; i++) {
                this.cs = this.log_arguments[i].compile(environment) && this.cs;
                if (this.log_arguments[i] instanceof L.EmptyElement)
                    continue;
                passedValues.push(this.log_arguments[i]);
            }
            this.errorIf(passedValues.length > 0, 'Argumnets for constructor are not supported yet');
            if (!this.cs)
                return false;
            this.errorIfNot(this.log_type.returns.varType instanceof TS.PrototypeType, 'Class definition expectad', this.log_type);
            if (!this.cs)
                return false;
            var classType = this.log_type.returns.varType;
            this.returns = new TS.RValueOfType(new TS.ReferenceType(new TS.ReferenceClassType(classType)));
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_type.run(environment);
            var classType = environment.popTempValue().getValue();
            var classObject = classType.defaultValue();
            yield* classObject.construct(environment);
            var onHeapElement = environment.addToHeap(classObject);
            environment.pushTempValue(new TS.Reference(new TS.ReferenceClass(classType), onHeapElement));
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.NewHeapObject = NewHeapObject;
})(L || (L = {}));
var E;
(function (E) {
    class NewHeapObject extends E.Element {
        constructor(typ = null, args = []) {
            super();
            this.c_type = new C.DropField(this, typ),
                this.c_arguments = new C.DropList(this, args);
            this.initialize([
                [
                    new C.Label('new'),
                    this.c_type,
                    new C.Label('('),
                    this.c_arguments,
                    new C.Label(')'),
                ],
            ], E.ElementType.Value);
        }
        getJSONName() { return 'NewHeapObject'; }
        constructCode() {
            var logic = new L.NewHeapObject(this.c_type.constructCode(), this.c_arguments.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new NewHeapObject(this.c_type.getContentCopy(), this.c_arguments.getContentCopy()).copyMetadata(this);
        }
    }
    E.NewHeapObject = NewHeapObject;
})(E || (E = {}));
var L;
(function (L) {
    class NewObject extends L.LogicElement {
        constructor(log_type, log_arguments) {
            super();
            this.log_type = log_type;
            this.log_arguments = log_arguments;
        }
        _compile(environment) {
            this.error('This element is not supported yet');
            if (!this.cs)
                return false;
            this.log_type.compile(environment);
            for (var i = 0; i < this.log_arguments.length; i++)
                this.log_arguments[i].compile(environment);
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_type.run(environment);
            var classType = environment.popTempValue().getValue();
            throw "Impelement this";
        }
    }
    L.NewObject = NewObject;
})(L || (L = {}));
var E;
(function (E) {
    class NewObject extends E.Element {
        constructor(typ = null, argumets = []) {
            super();
            this.c_type = new C.DropField(this, typ),
                this.c_arguments = new C.DropList(this, argumets);
            this.initialize([
                [
                    new C.Label('val'),
                    this.c_type,
                    new C.Label('('),
                    this.c_arguments,
                    new C.Label(')'),
                ],
            ], E.ElementType.Value);
        }
        getJSONName() { return 'NewObject'; }
        constructCode() {
            var logic = new L.NewObject(this.c_type.constructCode(), this.c_arguments.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new NewObject(this.c_type.getContentCopy(), this.c_arguments.getContentCopy()).copyMetadata(this);
        }
    }
    E.NewObject = NewObject;
})(E || (E = {}));
var L;
(function (L) {
    class Null extends L.LogicElement {
        constructor() {
            super();
        }
        _compile(environment) {
            this.returns = new TS.RValueOfType(new TS.ReferenceType(new TS.ReferenceClassType(TS.Void.typeInstance)));
            return true;
        }
        *execute(environment) {
            environment.pushTempValue(new TS.Reference(new TS.ReferenceClass(TS.Void.classInstance), null));
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.Null = Null;
})(L || (L = {}));
var E;
(function (E) {
    class Null extends E.Element {
        constructor() {
            super();
            this.c_name = new C.Label('null');
            this.initialize([
                [this.c_name]
            ], E.ElementType.Value);
        }
        getJSONName() { return 'Null'; }
        constructCode() {
            var logic = new L.Null();
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Null().copyMetadata(this);
        }
    }
    E.Null = Null;
})(E || (E = {}));
var L;
(function (L) {
    class Path extends L.LogicElement {
        constructor(log_left, name) {
            super();
            this.log_left = log_left;
            this.name = name;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_left);
            this.cs = this.log_left.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.errorIfNotInstance(this.log_left.returns.varType, this.log_left);
            if (!this.cs)
                return false;
            var leftType = this.log_left.returns.varType;
            while (leftType instanceof TS.ReferenceType && !leftType.hasMethod(this.name))
                leftType = leftType.prototypeType.referencedPrototypeType.declaresType();
            this.innerContext = leftType;
            var leftPrototype = leftType.prototypeType;
            if (leftPrototype instanceof TS.ClassType) {
                this.errorIfNot(leftPrototype.hasField(this.name) || leftPrototype.hasMethod(this.name), 'None field nor method of this name was found');
                if (!this.cs)
                    return false;
                if (leftPrototype.hasField(this.name))
                    this.returns = new TS.LValueOfType(leftPrototype.fields[this.name].typ);
                else
                    this.returns = new TS.RValueOfType(leftPrototype.functions[this.name].declaresType());
            }
            else {
                this.errorIfNot(leftPrototype.hasMethod(this.name), 'None method for this name was found');
                if (!this.cs)
                    return false;
                this.returns = new TS.RValueOfType(leftPrototype.functions[this.name].declaresType());
            }
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_left.run(environment);
            var isAlias = environment.isTempValueAlias();
            var thisMemoryField = environment.popTempValue();
            while (thisMemoryField.getValue() instanceof TS.Reference && !thisMemoryField.getValue().hasMethod(this.name)) {
                var reference = thisMemoryField.getValue().reference;
                if (!reference)
                    throw 'Null reference exception';
                thisMemoryField = reference;
                isAlias = true;
            }
            var valueLeft = thisMemoryField.getValue();
            if (valueLeft instanceof TS.ClassObject) {
                if (valueLeft.hasFieldValue(this.name)) {
                    var customTypeField = valueLeft.getFieldValue(this.name);
                    environment.pushTempAlias(customTypeField);
                }
                else if (valueLeft.hasMethod(this.name)) {
                    var method = valueLeft.getMethod(thisMemoryField, this.name, isAlias);
                    environment.pushTempValue(method);
                }
                else {
                    throw 'No such field or method was for this object';
                }
            }
            else {
                if (valueLeft.hasMethod(this.name)) {
                    var method = valueLeft.getMethod(thisMemoryField, this.name, isAlias);
                    environment.pushTempValue(method);
                }
                else {
                    throw 'No such field or method was for this object';
                }
            }
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.Path = Path;
})(L || (L = {}));
var E;
(function (E) {
    class Path extends E.Element {
        constructor(element = null, name = 'foo') {
            super();
            this.c_left = new C.DropField(this, element);
            this.c_right = new C.PenetratingTextField(this, name);
            this.initialize([
                [this.c_left, new C.Label('.'), this.c_right]
            ], E.ElementType.Type);
        }
        getJSONName() { return 'Path'; }
        constructCode() {
            var logic = new L.Path(this.c_left.constructCode(), this.c_right.getRawData());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Path(this.c_left.getContentCopy(), this.c_right.getRawData()).copyMetadata(this);
        }
    }
    E.Path = Path;
})(E || (E = {}));
var L;
(function (L) {
    class Programm extends L.LogicElement {
        constructor(log_list) {
            super();
            this.log_list = log_list;
        }
        _compile(environment) {
            this.compileBlock(environment, this.log_list);
            return this.cs;
        }
        *run(environment) {
            yield* L.LogicElement.prototype.run.call(this, environment);
            environment.clearCurrentTempScope();
            return;
        }
        *execute(environment) {
            environment.flowState = Memory.FlowState.NormalFlow;
            yield* Programm.executeBlock(environment, this.log_list);
            return;
        }
    }
    L.Programm = Programm;
})(L || (L = {}));
var E;
(function (E) {
    class ProgramParent {
        constructor(element) {
            this.element = element;
        }
        detachElement() {
        }
        attachElement(element) { }
        containsElement() {
            return true;
        }
        edited() {
            try {
                var programm = this.element.constructCode();
                programm.compile(new Compiler.TypeEnvironment());
            }
            catch (any) {
            }
        }
    }
    class Program extends E.Element {
        constructor(list = []) {
            super();
            this.c_list = new C.DropList(this, list);
            this.initialize([
                [new C.Label('|>')],
                [this.c_list],
                [new C.Label('')],
            ], E.ElementType.Program);
        }
        getJSONName() { return 'Program'; }
        constructCode() {
            var logic = new L.Programm(this.c_list.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Program(this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
    E.Program = Program;
})(E || (E = {}));
var L;
(function (L) {
    class Random extends L.LogicElement {
        constructor() {
            super();
        }
        _compile(environment) {
            this.returns = new TS.RValueOfType(new TS.ClassObjectType(TS.Int.typeInstance));
            return this.cs;
        }
        *execute(environment) {
            environment.pushTempValue(TS.Int.classInstance.getObjectOfValue(Math.floor(Math.random() * 100)));
            return;
        }
    }
    L.Random = Random;
})(L || (L = {}));
var E;
(function (E) {
    class Random extends E.Element {
        constructor() {
            super();
            this.initialize([
                [new C.Label('random()')]
            ], E.ElementType.Value);
        }
        getJSONName() { return 'Random'; }
        constructCode() {
            var logic = new L.Random();
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Random().copyMetadata(this);
        }
    }
    E.Random = Random;
})(E || (E = {}));
var L;
(function (L) {
    class RawData extends L.LogicElement {
        constructor(rawData) {
            super();
            this.rawData = rawData;
        }
        _compile(environment) {
            var value = this.rawData;
            var numberValue = parseInt(this.rawData);
            if (!isNaN(numberValue)) {
                this.observer.isNumber(true);
                this.returns = new TS.RValueOfType(new TS.ClassObjectType(TS.Int.typeInstance));
            }
            else {
                this.observer.isNumber(false);
                var typeField = environment.getElement(value);
                this.errorIf(!typeField, 'No field of that name was found in this scope');
                if (!this.cs)
                    return false;
                this.returns = new TS.LValueOfType(typeField.typ);
            }
            return this.cs;
        }
        *execute(environment) {
            var rawData = this.rawData;
            var value = parseInt(this.rawData);
            if (!isNaN(value)) {
                environment.pushTempValue(TS.Int.classInstance.getObjectOfValue(value));
            }
            else {
                var stackField = environment.getFromStack(rawData);
                environment.pushTempAlias(stackField);
            }
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.RawData = RawData;
})(L || (L = {}));
var E;
(function (E) {
    class RawData extends E.Element {
        constructor(value = 'foo') {
            super();
            this.c_data = new C.TextField(this, value);
            this.initialize([
                [this.c_data]
            ], E.ElementType.Value);
            this._isNumber = true;
        }
        getJSONName() { return 'RawData'; }
        constructCode() {
            var logic = new L.RawData(this.c_data.getRawData());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new RawData(this.c_data.getRawData()).copyMetadata(this);
        }
        isNumber(num) {
            if (num != this._isNumber) {
                this._isNumber = num;
                this.clearStyles();
                this.setStyle(num ? E.ElementType.Value : E.ElementType.Variable);
            }
        }
    }
    E.RawData = RawData;
})(E || (E = {}));
var L;
(function (L) {
    class Ref extends L.LogicElement {
        constructor(log_type) {
            super();
            this.log_type = log_type;
        }
        _compile(environment) {
            this.cs = this.log_type.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.errorIfEmpty(this.log_type);
            if (!this.cs)
                return false;
            this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
            if (!this.cs)
                return false;
            var prototypeType = this.log_type.returnsType();
            this.returns = new TS.RValueOfType(new TS.ReferenceClassType(prototypeType));
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_type.run(environment);
            var tempValue = environment.popTempValue().getValue();
            environment.pushTempValue(new TS.ReferenceClass(tempValue));
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.Ref = Ref;
})(L || (L = {}));
var E;
(function (E) {
    class Ref extends E.Element {
        constructor(typ = null) {
            super();
            this.c_type = new C.DropField(this, typ);
            this.initialize([
                [
                    this.c_type,
                    new C.Label('ref'),
                ]
            ], E.ElementType.Type);
        }
        getJSONName() { return 'Ref'; }
        constructCode() {
            var logic = new L.Ref(this.c_type.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Ref(this.c_type.getContentCopy()).copyMetadata(this);
        }
    }
    E.Ref = Ref;
})(E || (E = {}));
var L;
(function (L) {
    class RefDeclaration extends L.VarDeclaration {
        constructor(name, log_type) {
            super(name, new L.Ref(log_type).setAsInternalOperation());
        }
    }
    L.RefDeclaration = RefDeclaration;
})(L || (L = {}));
var E;
(function (E) {
    class ReferenceDeclaration extends E.Element {
        constructor(name = 'foo', typ = null) {
            super();
            this.c_name = new C.TextField(this, name);
            this.c_type = new C.DropField(this, typ);
            this.initialize([
                [new C.Label('ref'), this.c_name, new C.Label(':'), this.c_type]
            ], E.ElementType.Variable);
        }
        getJSONName() { return 'ReferenceDeclaration'; }
        constructCode() {
            var logic = new L.RefDeclaration(this.c_name.getRawData(), this.c_type.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new ReferenceDeclaration(this.c_name.getRawData(), this.c_type.getContentCopy()).copyMetadata(this);
        }
    }
    E.ReferenceDeclaration = ReferenceDeclaration;
})(E || (E = {}));
var L;
(function (L) {
    class RefDefinition extends L.VarDefinition {
        constructor(name, log_type, log_value) {
            super(name, new L.Ref(log_type).setAsInternalOperation(), log_value);
        }
    }
    L.RefDefinition = RefDefinition;
})(L || (L = {}));
var E;
(function (E) {
    class ReferenceDefinition extends E.Element {
        constructor(name = 'foo', typ = null, value = null) {
            super();
            this.c_name = new C.TextField(this, name);
            this.c_type = new C.DropField(this, typ);
            this.c_value = new C.DropField(this, value);
            this.initialize([
                [new C.Label('ref'), this.c_name, new C.Label(':'), this.c_type, new C.Label('='), this.c_value]
            ], E.ElementType.Variable);
        }
        getJSONName() { return 'ReferenceDefinition'; }
        constructCode() {
            var logic = new L.RefDefinition(this.c_name.getRawData(), this.c_type.constructCode(), this.c_value.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new ReferenceDefinition(this.c_name.getRawData(), this.c_type.getContentCopy(), this.c_value.getContentCopy()).copyMetadata(this);
        }
    }
    E.ReferenceDefinition = ReferenceDefinition;
})(E || (E = {}));
var L;
(function (L) {
    class ReferenceOf extends L.LogicElement {
        constructor(log_value) {
            super();
            this.log_value = log_value;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_value);
            this.cs = this.log_value.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.errorIfNot(this.log_value.returns instanceof TS.LValueOfType, 'Expected l-value', this.log_value);
            if (!this.cs)
                return false;
            var valueType = this.log_value.returns.varType;
            this.errorIfNot(valueType instanceof TS.InstanceType, 'Expected type instance', this.log_value);
            if (!this.cs)
                return false;
            var instanceType = valueType;
            this.returns = new TS.LValueOfType(new TS.ReferenceType(new TS.ReferenceClassType(instanceType.prototypeType)));
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_value.run(environment);
            var field = environment.popTempValue();
            var value = field.getValue();
            environment.pushTempValue(new TS.Reference(new TS.ReferenceClass(value.prototype), field));
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.ReferenceOf = ReferenceOf;
})(L || (L = {}));
var E;
(function (E) {
    class ReferenceOf extends E.Element {
        constructor(object = null) {
            super();
            this.c_object = new C.DropField(this);
            this.initialize([
                [
                    new C.Label('ref of'),
                    this.c_object,
                ]
            ], E.ElementType.Value);
        }
        getJSONName() { return 'ReferenceOf'; }
        constructCode() {
            var logic = new L.ReferenceOf(this.c_object.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new ReferenceOf(this.c_object.getContentCopy()).copyMetadata(this);
        }
    }
    E.ReferenceOf = ReferenceOf;
})(E || (E = {}));
var L;
(function (L) {
    class RefLike extends L.LogicElement {
        constructor(log_value) {
            super();
            this.log_value = log_value;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_value);
            this.cs = this.log_value.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            var valueType = this.log_value.returns.varType;
            this.errorIfNot(valueType instanceof TS.InstanceType, 'Expected type instance', this.log_value);
            if (!this.cs)
                return false;
            var instanceType = valueType;
            this.returns = new TS.LValueOfType(new TS.ReferenceType(new TS.ReferenceClassType(instanceType.prototypeType)));
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_value.run(environment);
            var value = environment.popTempValue().getValue();
            var field = environment.addToHeap(value.getCopy());
            environment.pushTempValue(new TS.Reference(new TS.ReferenceClass(value.prototype), field));
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.RefLike = RefLike;
})(L || (L = {}));
var E;
(function (E) {
    class ReferenceLike extends E.Element {
        constructor(object = null) {
            super();
            this.c_object = new C.DropField(this, object);
            this.initialize([
                [
                    new C.Label('ref like'),
                    this.c_object,
                ]
            ], E.ElementType.Value);
        }
        getJSONName() { return 'ReferenceLike'; }
        constructCode() {
            var logic = new L.RefLike(this.c_object.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new ReferenceLike(this.c_object.getContentCopy()).copyMetadata(this);
        }
    }
    E.ReferenceLike = ReferenceLike;
})(E || (E = {}));
var L;
(function (L) {
    class Return extends L.LogicElement {
        constructor(log_value) {
            super();
            this.log_value = log_value;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_value);
            this.cs = this.log_value.compile(environment) && this.cs;
            this.errorIfNot(environment.isInContext(Compiler.Context.Function), 'You can return valus only form inside of a function');
            this.errorIfTypeMismatch(TS.rValue(environment.getFunctionExpection()), this.log_value.returns, this);
            this.flowState = Compiler.FlowState.Return;
            if (!this.cs)
                return false;
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_value.run(environment);
            var value = environment.popTempValue().getValue().getCopy();
            environment.pushTempValue(value);
            environment.flowState = Memory.FlowState.Return;
            yield L.Operation.flow(this);
            return;
        }
    }
    L.Return = Return;
})(L || (L = {}));
var E;
(function (E) {
    class Return extends E.Element {
        constructor(mesage = null) {
            super();
            this.c_value = new C.DropField(this, mesage);
            this.initialize([
                [
                    new C.Label('return'),
                    this.c_value,
                ]
            ], E.ElementType.Function);
        }
        getJSONName() { return 'Return'; }
        constructCode() {
            var logic = new L.Return(this.c_value.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Return(this.c_value.getContentCopy()).copyMetadata(this);
        }
    }
    E.Return = Return;
})(E || (E = {}));
var L;
(function (L) {
    class Scope extends L.LogicElement {
        constructor(log_list) {
            super();
            this.log_list = log_list;
        }
        _compile(environment) {
            for (var i = 0; i < this.log_list.length; i++)
                this.cs = this.log_list[i].compile(environment) && this.cs;
            return this.cs;
        }
        *execute(environment) {
            environment.addScope('Scope');
            yield L.Operation.memory(this);
            for (var i = 0; i < this.log_list.length; i++)
                yield* this.log_list[i].run(environment);
            environment.removeScope();
            yield L.Operation.memory(this);
            return;
        }
    }
    L.Scope = Scope;
})(L || (L = {}));
var E;
(function (E) {
    class Scope extends E.Element {
        constructor(elements = []) {
            super();
            this.c_list = new C.DropList(this, elements);
            this.initialize([
                [new C.Label('{')],
                [this.c_list],
                [new C.Label('}')]
            ], E.ElementType.Flow);
        }
        getJSONName() { return 'Scope'; }
        constructCode() {
            var logic = new L.Scope(this.c_list.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Scope(this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
    E.Scope = Scope;
})(E || (E = {}));
var L;
(function (L) {
    class Set extends L.LogicElement {
        constructor(log_left, log_right) {
            super();
            this.log_left = log_left;
            this.log_right = log_right;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_left);
            this.errorIfEmpty(this.log_right);
            this.cs = this.log_right.compile(environment) && this.cs;
            this.cs = this.log_left.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.errorIfNot(this.log_left.returns instanceof TS.LValueOfType, 'Expected L-value', this.log_left);
            if (!this.cs)
                return false;
            var leftType = this.log_left.returns.varType;
            var rightType = this.log_right.returns.varType;
            this.errorIfNot(leftType instanceof TS.InstanceType, 'Expected type instance', this.log_left);
            this.errorIfNot(rightType instanceof TS.InstanceType, 'Expected type instance', this.log_right);
            if (!this.cs)
                return false;
            this.errorIfTypeMismatch(TS.rValue(leftType), this.log_right.returns, this.log_right);
            if (!this.cs)
                return false;
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_right.run(environment);
            yield* this.log_left.run(environment);
            var valueLeft = environment.popTempValue();
            var valueRight = environment.popTempValue();
            valueLeft.setValue(valueRight.getValue().getCopy());
            yield L.Operation.memory(this);
            return;
        }
    }
    L.Set = Set;
})(L || (L = {}));
var E;
(function (E) {
    class Set extends E.Element {
        constructor(left = null, right = null) {
            super();
            this.c_left = new C.DropField(this, left),
                this.c_right = new C.DropField(this, right);
            this.initialize([
                [this.c_left, new C.Label('='), this.c_right]
            ], E.ElementType.Variable);
        }
        getJSONName() { return 'Set'; }
        constructCode() {
            var logic = new L.Set(this.c_left.constructCode(), this.c_right.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Set(this.c_left.getContentCopy(), this.c_right.getContentCopy()).copyMetadata(this);
        }
    }
    E.Set = Set;
})(E || (E = {}));
var L;
(function (L) {
    class String extends L.LogicElement {
        constructor() {
            super();
        }
        _compile(environment) {
            this.returns = new TS.RValueOfType(TS.String.typeInstance);
            return true;
        }
        *execute(environment) {
            environment.pushTempValue(TS.String.classInstance);
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.String = String;
})(L || (L = {}));
var E;
(function (E) {
    class String extends E.Element {
        constructor() {
            super();
            this.initialize([
                [new C.Label('string')]
            ], E.ElementType.Type);
        }
        getJSONName() { return 'String'; }
        constructCode() {
            var logic = new L.String();
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new String().copyMetadata(this);
        }
    }
    E.String = String;
})(E || (E = {}));
var L;
(function (L) {
    class StringLiteral extends L.LogicElement {
        constructor(rawData) {
            super();
            this.rawData = rawData;
        }
        _compile(environment) {
            var value = this.rawData;
            this.observer.isNumber(true);
            this.returns = new TS.RValueOfType(new TS.ClassObjectType(TS.String.typeInstance));
            return this.cs;
        }
        *execute(environment) {
            var rawData = this.rawData;
            environment.pushTempValue(TS.String.classInstance.getObjectOfValue(rawData));
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.StringLiteral = StringLiteral;
})(L || (L = {}));
var E;
(function (E) {
    class StringLiteral extends E.Element {
        constructor(value = 'foo') {
            super();
            this.c_data = new C.TextField(this, value);
            this.initialize([
                [new C.Label('"'), this.c_data, new C.Label('"')]
            ], E.ElementType.Value);
            this._isNumber = true;
        }
        getJSONName() { return 'StringLiteral'; }
        constructCode() {
            var logic = new L.StringLiteral(this.c_data.getRawData());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new StringLiteral(this.c_data.getRawData()).copyMetadata(this);
        }
        isNumber(num) {
            if (num != this._isNumber) {
                this._isNumber = num;
                this.clearStyles();
                this.setStyle(num ? E.ElementType.Value : E.ElementType.Variable);
            }
        }
    }
    E.StringLiteral = StringLiteral;
})(E || (E = {}));
var L;
(function (L) {
    class True extends L.LogicElement {
        constructor() {
            super();
        }
        _compile(environment) {
            this.returns = new TS.RValueOfType(new TS.ClassObjectType(TS.Boolean.typeInstance));
            return true;
        }
        *execute(environment) {
            environment.pushTempValue(TS.Boolean.classInstance.getObjectOfValue(true));
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.True = True;
})(L || (L = {}));
var E;
(function (E) {
    class True extends E.Element {
        constructor() {
            super();
            this.c_name = new C.Label('true');
            this.initialize([
                [this.c_name]
            ], E.ElementType.Value);
        }
        getJSONName() { return 'True'; }
        constructCode() {
            var logic = new L.True();
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new True().copyMetadata(this);
        }
    }
    E.True = True;
})(E || (E = {}));
var L;
(function (L) {
    class ValueOf extends L.LogicElement {
        constructor(log_value) {
            super();
            this.log_value = log_value;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_value);
            this.cs = this.log_value.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.errorIfNot(this.log_value.returns.varType instanceof TS.ReferenceClassType, 'Expected reference', this.log_value);
            if (!this.cs)
                return false;
            var reference = this.log_value.returns.varType;
            this.returns = new TS.RValueOfType(reference.referencedPrototypeType);
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_value.run(environment);
            var reference = environment.popTempValue().getValue();
            environment.pushTempAlias(reference.reference);
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.ValueOf = ValueOf;
})(L || (L = {}));
var E;
(function (E) {
    class ValueOf extends E.Element {
        constructor(object = null) {
            super();
            this.c_object = new C.DropField(this, object);
            this.initialize([
                [
                    new C.Label('val of'),
                    this.c_object,
                ]
            ], E.ElementType.Value);
        }
        getJSONName() { return 'ValueOf'; }
        constructCode() {
            var logic = new L.ValueOf(this.c_object.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new ValueOf(this.c_object.getContentCopy()).copyMetadata(this);
        }
    }
    E.ValueOf = ValueOf;
})(E || (E = {}));
var L;
(function (L) {
    class TypeOf extends L.LogicElement {
        constructor(log_type) {
            super();
            this.log_type = log_type;
        }
        _compile(environment) {
            this.errorIfEmpty(this.log_type);
            this.cs = this.log_type.compile(environment) && this.cs;
            if (!this.cs)
                return false;
            this.errorIfNotInstance(this.log_type.returnsType(), this.log_type);
            if (!this.cs)
                return false;
            var prototype = this.log_type.returns.varType.prototypeType;
            this.returns = new TS.RValueOfType(prototype);
            return this.cs;
        }
        *execute(environment) {
            yield* this.log_type.run(environment);
            var prototype = environment.popTempValue().getValue().prototype;
            environment.pushTempValue(prototype);
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.TypeOf = TypeOf;
})(L || (L = {}));
var E;
(function (E) {
    class TypeOf extends E.Element {
        constructor(object = null) {
            super();
            this.c_object = new C.DropField(this, object);
            this.initialize([
                [
                    new C.Label('type of'),
                    this.c_object,
                ]
            ], E.ElementType.Type);
        }
        getJSONName() { return 'TypeOf'; }
        constructCode() {
            var logic = new L.TypeOf(this.c_object.constructCode());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new TypeOf(this.c_object.getContentCopy()).copyMetadata(this);
        }
    }
    E.TypeOf = TypeOf;
})(E || (E = {}));
var L;
(function (L) {
    class Void extends L.LogicElement {
        constructor() {
            super();
        }
        _compile(environment) {
            this.returns = new TS.RValueOfType(TS.Void.typeInstance);
            return true;
        }
        *execute(environment) {
            environment.pushTempValue(TS.Void.classInstance);
            yield L.Operation.tempMemory(this);
            return;
        }
    }
    L.Void = Void;
})(L || (L = {}));
var E;
(function (E) {
    class Void extends E.Element {
        constructor() {
            super();
            this.initialize([
                [new C.Label('void')]
            ], E.ElementType.Type);
        }
        getJSONName() { return 'Void'; }
        constructCode() {
            var logic = new L.Void();
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new Void().copyMetadata(this);
        }
    }
    E.Void = Void;
})(E || (E = {}));
var L;
(function (L) {
    class WhileLoop extends L.LogicElement {
        constructor(log_condition, log_list) {
            super();
            this.log_condition = log_condition;
            this.log_list = log_list;
            log_condition.setAsInternalOperation();
        }
        _compile(environment) {
            environment.addScope();
            this.cs = this.log_condition.compile(environment) && this.cs;
            environment.addContext(Compiler.Context.Loop);
            this.compileBlock(environment, this.log_list);
            environment.removeContext();
            environment.removeScope();
            if (!this.cs)
                return false;
            this.errorIfTypeMismatch(TS.rValue(TS.Boolean.objectTypeInstance), this.log_condition.returns, this.log_condition);
            return this.cs;
        }
        *execute(environment) {
            yield L.Operation.memory(this);
            while (true) {
                yield* this.log_condition.run(environment);
                yield L.Operation.flow(this.log_condition);
                var condition = environment.popTempValue().getValue();
                environment.clearCurrentTempScope();
                if (!condition.rawValue)
                    break;
                environment.addScope('While loop');
                yield* WhileLoop.executeBlock(environment, this.log_list);
                var removedScope = environment.removeScope();
                if (environment.flowState == Memory.FlowState.Break) {
                    environment.flowState = Memory.FlowState.NormalFlow;
                    environment.clearCurrentTempScope();
                    break;
                }
                if (environment.flowState == Memory.FlowState.Return) {
                    break;
                }
                else {
                    environment.flowState = Memory.FlowState.NormalFlow;
                }
            }
            return;
        }
    }
    L.WhileLoop = WhileLoop;
})(L || (L = {}));
var E;
(function (E) {
    class WhileLoop extends E.Element {
        constructor(cond = null, list = []) {
            super();
            this.c_condition = new C.DropField(this, cond);
            this.c_list = new C.DropList(this, list);
            this.initialize([
                [
                    new C.Label('while ('),
                    this.c_condition,
                    new C.Label(')'),
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
            ], E.ElementType.Flow);
        }
        getJSONName() { return 'WhileLoop'; }
        constructCode() {
            var logic = new L.WhileLoop(this.c_condition.constructCode(), this.c_list.getLogicComponents());
            logic.setObserver(this);
            return logic;
        }
        getCopy() {
            return new WhileLoop(this.c_condition.getContentCopy(), this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
    E.WhileLoop = WhileLoop;
})(E || (E = {}));
var TypeSystemObserver;
(function (TypeSystemObserver) {
    class VoidObjectObserver {
        constructor(object) {
            this.object = object;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectElement');
            }
            return this.element;
        }
        updateUI() {
        }
    }
    TypeSystemObserver.VoidObjectObserver = VoidObjectObserver;
    class BaseClassObjectObserver {
        constructor(object) {
            this.object = object;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectElement');
                this.value = $('<div></div>');
                this.value.addClass('baseObjectValue');
                this.value.append(this.object.rawValue);
                this.element.append(this.value);
            }
            return this.element;
        }
        updateUI() {
            this.value.text(this.object.rawValue);
        }
    }
    TypeSystemObserver.BaseClassObjectObserver = BaseClassObjectObserver;
    class FunctionObserver {
        constructor(fun) {
            this.fun = fun;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectElement');
                this.value = $('<div></div>');
                this.value.addClass('customObjectValue');
                this.value.text('<fun>');
                this.element.append(this.value);
            }
            return this.element;
        }
        updateUI() { }
    }
    TypeSystemObserver.FunctionObserver = FunctionObserver;
    class ClassFieldObserver {
        constructor(field) {
            this.field = field;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectField');
                this.elementName = $('<div></div>');
                this.elementName.addClass('objectFieldName');
                this.elementValue = $('<div></div>');
                this.elementValue.addClass('objectFieldValue');
                this.elementName.append(this.field.name);
                this.element.append(this.elementName);
                this.element.append(this.elementValue);
            }
            return this.element;
        }
        setFieldValue(value) {
            this.getElement();
            this.elementValue.empty();
            this.elementValue.append(value.observer.getElement());
            value.observer.updateUI();
        }
        updateUI() {
            DS.Stack.forAll(this.field.getReferences(), (value) => {
                value.observer.updateUI();
            });
            this.field.getValue().observer.updateUI();
        }
    }
    TypeSystemObserver.ClassFieldObserver = ClassFieldObserver;
    class ClassObjectObserver {
        constructor(object) {
            this.object = object;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectElement');
                var fields = this.object.fields;
                for (var key in fields) {
                    this.element.append(fields[key].observer.getElement());
                }
            }
            return this.element;
        }
        updateUI() {
            for (var key in this.object.fields) {
                this.object.fields[key].observer.updateUI();
            }
        }
    }
    TypeSystemObserver.ClassObjectObserver = ClassObjectObserver;
    class ArrayFieldObserver {
        constructor(field) {
            this.field = field;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectField');
                this.elementIndex = $('<div></div>');
                this.elementIndex.addClass('objectFieldName');
                this.elementValue = $('<div></div>');
                this.elementValue.addClass('objectFieldValue');
                this.elementIndex.append(this.field.index.toString());
                this.element.append(this.elementIndex);
                this.element.append(this.elementValue);
            }
            return this.element;
        }
        setFieldValue(value) {
            this.getElement();
            this.elementValue.empty();
            this.elementValue.append(value.observer.getElement());
        }
        updateUI() {
            DS.Stack.forAll(this.field.getReferences(), (value) => {
                value.observer.updateUI();
            });
            this.field.getValue().observer.updateUI();
        }
    }
    TypeSystemObserver.ArrayFieldObserver = ArrayFieldObserver;
    class ArrayObjectObserver {
        constructor(object) {
            this.object = object;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectElement');
                var fields = this.object.values;
                for (var i = 0; i < this.object.prototype.length; i++) {
                    this.element.append(fields[i].observer.getElement());
                }
            }
            return this.element;
        }
        updateUI() {
            for (var i = 0; i < this.object.prototype.length; i++) {
                this.object.values[i].observer.updateUI();
            }
        }
    }
    TypeSystemObserver.ArrayObjectObserver = ArrayObjectObserver;
    class ReferenceObserver {
        constructor(reference) {
            this.reference = reference;
            this.strokeColor = '#5a2569';
            this.fillColor = '#9e61b0';
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectElement');
                this.element.addClass('reference');
                this.svg = $('<svg class="svgConnection"></svg>');
                this.svgCircleB = GUI.svgElement('circle').appendTo(this.svg).attr('fill', this.strokeColor).attr('r', '5');
                var svgBackground = GUI.svgElement('g').addClass('svgBackground').appendTo(this.svg).attr('stroke', this.strokeColor).attr('stroke-width', '4').attr('fill', 'transparent').attr('stroke-linecap', 'round');
                this.svgLineB = GUI.svgElement('path').appendTo(svgBackground);
                this.svgArrow1B = GUI.svgElement('path').appendTo(svgBackground);
                this.svgArrow2B = GUI.svgElement('path').appendTo(svgBackground);
                this.svgCircleA = GUI.svgElement('circle').appendTo(this.svg).attr('fill', this.fillColor).attr('r', '4');
                var svgForeground = GUI.svgElement('g').addClass('svgForeground').appendTo(this.svg).attr('stroke', this.fillColor).attr('stroke-width', '2').attr('fill', 'transparent').attr('stroke-linecap', 'round');
                this.svgLineA = GUI.svgElement('path').appendTo(svgForeground);
                this.svgArrow1A = GUI.svgElement('path').appendTo(svgForeground);
                this.svgArrow2A = GUI.svgElement('path').appendTo(svgForeground);
                this.element.append(this.svg);
                this.value = $('<div></div>');
                this.value.addClass('referenceValue');
                this.element.append(this.value);
            }
            return this.element;
        }
        updateUI() {
            this.getElement();
            if (this.reference.reference) {
                var referenced = this.reference.reference.observer.getElement();
                var endPoint = {
                    x: referenced.offset().left + 2 - (this.element.offset().left + this.element.width() / 2),
                    y: referenced.offset().top + referenced.height() / 2 - (this.element.offset().top + this.element.height() / 2)
                };
                var offset = Math.sqrt(Math.pow(endPoint.x, 2) + Math.pow(endPoint.y, 2)) / 2;
                var bizarreCurve = 'M0,0 C0,0 ' + (endPoint.x - offset) + ',' + endPoint.y + ' ' + endPoint.x + ',' + endPoint.y + ' C' + (endPoint.x - offset) + ',' + endPoint.y + ' 0,0 0,0';
                this.svgLineA.attr('d', bizarreCurve);
                this.svgLineB.attr('d', bizarreCurve);
                var arrow1 = 'M ' + endPoint.x + ',' + endPoint.y + ' L' + (endPoint.x - 5) + ',' + (endPoint.y - 5);
                var arrow2 = 'M ' + endPoint.x + ',' + endPoint.y + ' L' + (endPoint.x - 5) + ',' + (endPoint.y + 5);
                this.svgArrow1A.attr('d', arrow1);
                this.svgArrow1B.attr('d', arrow1);
                this.svgArrow2A.attr('d', arrow2);
                this.svgArrow2B.attr('d', arrow2);
            }
            else {
                var bizarreCurve = 'M0,0 L20,0';
                this.svgLineA.attr('d', bizarreCurve);
                this.svgLineB.attr('d', bizarreCurve);
                var arrow1 = 'M20,0 L20,-5';
                var arrow2 = 'M20,0 L20,5';
                this.svgArrow1A.attr('d', arrow1);
                this.svgArrow1B.attr('d', arrow1);
                this.svgArrow2A.attr('d', arrow2);
                this.svgArrow2B.attr('d', arrow2);
            }
        }
    }
    TypeSystemObserver.ReferenceObserver = ReferenceObserver;
    class AliasObserver extends ReferenceObserver {
        constructor(...args) {
            super(...args);
            this.strokeColor = '#2f652b';
            this.fillColor = '#467d42';
        }
    }
    TypeSystemObserver.AliasObserver = AliasObserver;
    class PrototypeObserver {
        constructor(typ) {
            this.typ = typ;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectElement');
                this.value = $('<div></div>');
                this.value.addClass('customObjectValue');
                this.value.text('<type>');
                this.element.append(this.value);
            }
            return this.element;
        }
        updateUI() { }
    }
    TypeSystemObserver.PrototypeObserver = PrototypeObserver;
})(TypeSystemObserver || (TypeSystemObserver = {}));
var MemoryObservers;
(function (MemoryObservers) {
    class StackFieldLabel {
        constructor(index) {
            this.index = index;
            this.element = $('<div></div>').addClass('stackField');
            this.setText(index);
        }
        setText(index) {
            this.element.empty();
            var hex = index.toString(16);
            this.element.text('0x' + '00000'.slice(hex.length) + hex);
        }
    }
    var _environmentObserver = null;
    function getEnvironmentObserver() {
        if (!_environmentObserver)
            _environmentObserver = new EnvironmentObserver();
        return _environmentObserver;
    }
    MemoryObservers.getEnvironmentObserver = getEnvironmentObserver;
    class EnvironmentObserver {
        constructor() {
            this.stackValues = $('<div></div>').addClass('stackValuesHolder');
            this.tempStackValues = $('<div></div>').addClass('stackValuesHolder');
            this.stackLabels = $('<div></div>').addClass('stackLabels');
            this.tempStackLabels = $('<div></div>').addClass('stackLabels');
            this.stackLabelsInner = $('<div></div>').addClass('stackLabelsInner');
            this.tempStackLabelsInner = $('<div></div>').addClass('stackLabelsInner');
            this.stackFieldsNumber = 0;
            this.tempStackFieldsNumber = 0;
            this.tempStack = $('.tempStack');
            this.stack = $('.stack');
            this.heap = $('.heap');
            this.stack.append($('<div></div>').addClass('stackPartName').text('Stack'));
            this.tempStack.append($('<div></div>').addClass('stackPartName').text('Temporary'));
            this.stack.append(this.stackLabels);
            this.stackLabels.append(this.stackLabelsInner);
            this.tempStack.append(this.tempStackLabels);
            this.tempStackLabels.append(this.tempStackLabelsInner);
            this.stack.append(this.stackValues);
            this.tempStack.append(this.tempStackValues);
            this.clear();
        }
        clear() {
            this.heap.empty();
            this.stackValues.empty();
            this.tempStackValues.empty();
            this.stackLabelsInner.empty();
            this.tempStackLabelsInner.empty();
            this.stackFieldsNumber = 0;
            this.tempStackFieldsNumber = 0;
            for (var i = 0; i < 140; i++) {
                this.addStackLabel();
                this.addTempStackLabel();
            }
            this.updateLabelsOffest();
            this.updateTempLabelsOffest();
        }
        addStackLabel() {
            var newStackField = new StackFieldLabel(this.stackFieldsNumber);
            this.stackLabelsInner.append(newStackField.element);
            this.stackFieldsNumber++;
        }
        addTempStackLabel() {
            var newStackField = new StackFieldLabel(this.tempStackFieldsNumber);
            this.tempStackLabelsInner.append(newStackField.element);
            this.tempStackFieldsNumber++;
        }
        updateLabelsOffest() {
            var valuesHeight = this.stackValues.innerHeight();
            this.stackLabels.css('margin-top', valuesHeight);
            this.stackLabelsInner.css('margin-top', -valuesHeight);
        }
        updateTempLabelsOffest() {
            var valuesHeight = this.tempStackValues.innerHeight();
            this.tempStackLabels.css('margin-top', valuesHeight);
            this.tempStackLabelsInner.css('margin-top', -valuesHeight);
        }
        addFieldToStack(field) {
            this.stackValues.append(field.observer.getElement());
            field.observer.updateUI();
            this.updateLabelsOffest();
        }
        removeFieldFromStack(field) {
            field.observer.getElement().detach();
            this.updateLabelsOffest();
        }
        addScopeToStack(scope) {
            this.stackValues.append(scope.observer.getElement());
            scope.observer.updateUI();
            this.updateLabelsOffest();
        }
        removeScopeFromStack(scope) {
            scope.observer.getElement().detach();
            this.updateLabelsOffest();
        }
        addFieldToHeap(field) {
            var element = field.observer.getElement();
            element.css('left', this.heap.width() / 4);
            var relativeElement = this.heap.children().last();
            if (relativeElement.length)
                element.css('top', parseInt(relativeElement.css('top')) + relativeElement.height() + 20);
            else
                element.css('top', 10);
            this.heap.append(field.observer.getElement());
            field.observer.updateUI();
        }
        addFieldToTempStack(field) {
            this.tempStackValues.append(field.observer.getElement());
            field.observer.updateUI();
            this.updateTempLabelsOffest();
        }
        removeFieldFromTempStack(field) {
            field.observer.getElement().detach();
            this.updateTempLabelsOffest();
        }
    }
    class ScopeObserver {
        constructor(scope) {
            this.scope = scope;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('scope');
                var wrapper = $('<div></div>');
                this.elementName = $('<div></div>');
                this.elementName.addClass('scopeName');
                this.elementName.append(this.scope.name);
                this.element.append(this.elementName);
            }
            return this.element;
        }
        updateUI() { }
        visible(isVisible) {
            if (isVisible)
                this.element.removeClass('onStackElementHidden');
            else
                this.element.addClass('onStackElementHidden');
        }
    }
    MemoryObservers.ScopeObserver = ScopeObserver;
    class StackFieldObserver {
        constructor(field) {
            this.field = field;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('onStackElement');
                var wrapper = $('<div></div>');
                this.elementName = $('<div></div>');
                this.elementName.addClass('onStackElementName');
                this.elementValue = $('<div></div>');
                this.elementValue.addClass('onStackElementValue');
                this.elementName.append(this.field.name);
                this.element.append(this.elementName);
                this.element.append(this.elementValue);
            }
            return this.element;
        }
        setFieldValue(value) {
            this.getElement();
            this.elementValue.empty();
            this.elementValue.append(value.observer.getElement());
            value.observer.updateUI();
        }
        updateUI() {
            DS.Stack.forAll(this.field.getReferences(), (value) => {
                value.observer.updateUI();
            });
            this.field.getValue().observer.updateUI();
        }
        visible(isVisible) {
            if (isVisible)
                this.element.removeClass('onStackElementHidden');
            else
                this.element.addClass('onStackElementHidden');
        }
    }
    MemoryObservers.StackFieldObserver = StackFieldObserver;
    class TempStackFieldObserver {
        constructor(field) {
            this.field = field;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('onStackElement');
                var wrapper = $('<div></div>');
                this.elementValue = $('<div></div>');
                this.elementValue.addClass('onStackElementValue');
                this.element.append(this.elementValue);
            }
            return this.element;
        }
        setFieldValue(value) {
            this.getElement();
            this.elementValue.empty();
            this.elementValue.append(value.observer.getElement());
            value.observer.updateUI();
        }
        updateUI() {
            DS.Stack.forAll(this.field.getReferences(), (value) => {
                value.observer.updateUI();
            });
            this.field.getValue().observer.updateUI();
        }
    }
    MemoryObservers.TempStackFieldObserver = TempStackFieldObserver;
    class HeapFieldObserver {
        constructor(field) {
            this.field = field;
            this.UIUpdated = true;
        }
        getElement() {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('onHeapElement');
                this.elementValue = $('<div></div>');
                this.elementValue.addClass('onHeapElementValue');
                this.element.append(this.elementValue);
                this.element.draggable({
                    scroll: false,
                    containment: "parent",
                    drag: (event, ui) => {
                        if (!this.UIUpdated)
                            return;
                        this.UIUpdated = false;
                        requestAnimationFrame(() => {
                            this.updateUI();
                        });
                    },
                    stop: (event, ui) => {
                        this.updateUI();
                    }
                });
            }
            return this.element;
        }
        setFieldValue(value) {
            this.getElement();
            this.elementValue.empty();
            this.elementValue.append(value.observer.getElement());
            value.observer.updateUI();
        }
        updateUI() {
            this.UIUpdated = false;
            DS.Stack.forAll(this.field.getReferences(), (value) => {
                value.observer.updateUI();
            });
            this.element.css('left', Math.min(parseInt(this.element.css('left')), this.element.parent().width() - this.element.outerWidth()));
            this.element.css('left', Math.max(parseInt(this.element.css('left')), 0));
            this.field.getValue().observer.updateUI();
            this.UIUpdated = true;
        }
    }
    MemoryObservers.HeapFieldObserver = HeapFieldObserver;
})(MemoryObservers || (MemoryObservers = {}));
var DS;
(function (DS) {
    class Stack {
        constructor() {
            this.tail = null;
        }
        static empty() {
            return null;
        }
        static push(element, stack) {
            if (!stack)
                stack = null;
            var newNode = new Stack();
            newNode.top = element;
            newNode.tail = stack;
            return newNode;
        }
        static pop(stack) {
            return stack.tail;
        }
        static top(stack) {
            if (!stack)
                throw 'Empty stack exception';
            return stack.top;
        }
        static remove(element, stack) {
            if (!stack)
                return Stack.empty();
            if (stack.top == element)
                return stack.tail;
            stack.tail = Stack.remove(element, stack);
            return stack;
        }
        static forAll(stack, operation) {
            if (stack) {
                operation(stack.top);
                Stack.forAll(stack.tail, operation);
            }
        }
    }
    DS.Stack = Stack;
    class Scope {
        constructor() {
            this.stack = Stack.empty();
        }
    }
    DS.Scope = Scope;
    class StackMap {
        constructor() {
            this.map = {};
            this.scopes = null;
        }
        addScope(scope) {
            this.scopes = Stack.push(scope, this.scopes);
        }
        removeScope() {
            if (!this.scopes)
                throw 'No scope to remove';
            var oldScope = this.scopes.top;
            this.scopes = this.scopes.tail;
            var scopeToRemove = oldScope.stack;
            while (scopeToRemove) {
                var name = scopeToRemove.top.name;
                this.map[name] = this.map[name].tail;
                scopeToRemove = scopeToRemove.tail;
            }
            return oldScope;
        }
        addElement(value) {
            this.map[value.name] = Stack.push(value, this.map[value.name]);
            this.scopes.top.stack = Stack.push(value, this.scopes.top.stack);
        }
        getScope() {
            return this.scopes.top;
        }
        getScopes() {
            return this.scopes;
        }
        getElement(name) {
            if (this.map[name])
                return this.map[name].top;
            else
                return null;
        }
        hasElement(name) {
            return !!this.map[name];
        }
        hasScope() {
            return !!this.scopes;
        }
    }
    DS.StackMap = StackMap;
})(DS || (DS = {}));
var Memory;
(function (Memory) {
    var MO = MemoryObservers;
    class Environment {
        constructor() {
            this.stack = new DS.StackMap();
            this.observer = MO.getEnvironmentObserver();
            this.heap = null;
            this.tempStackLevel = 0;
            this.tempStackTop = null;
            this.flowState = FlowState.NormalFlow;
            this.addScope('Environment');
        }
        addValueToStack(val, name) {
            if (this.stack.hasElement(name)) {
                this.stack.getElement(name).observer.visible(false);
            }
            var field = new StackField(name);
            field.setValue(val);
            this.stack.addElement(field);
            this.observer.addFieldToStack(field);
        }
        addAliasToStack(referenced, name) {
            var value = referenced.getValue();
            this.addValueToStack(new TS.Alias(new TS.ReferenceClass(value.prototype), referenced), name);
        }
        getFromStack(name) {
            var field = this.stack.getElement(name);
            if (field.getValue() instanceof TS.Alias)
                return field.getValue().reference;
            else
                return field;
        }
        addScope(name) {
            if (this.stack.hasScope())
                this.stack.getScope().observer.visible(false);
            var scope = new StackScope(name);
            this.stack.addScope(scope);
            this.observer.addScopeToStack(scope);
        }
        removeScope() {
            var removedScope = this.stack.removeScope();
            var stack = removedScope.stack;
            while (stack) {
                var field = stack.top;
                this.observer.removeFieldFromStack(field);
                if (this.stack.hasElement(field.name))
                    this.stack.getElement(field.name).observer.visible(true);
                stack = stack.tail;
            }
            this.observer.removeScopeFromStack(removedScope);
            if (this.stack.hasScope())
                this.stack.getScope().observer.visible(true);
        }
        addToHeap(val) {
            var field = new HeapField();
            field.setValue(val);
            this.heap = DS.Stack.push(field, this.heap);
            this.observer.addFieldToHeap(field);
            return field;
        }
        addTempStackScope() {
            this.tempStackLevel++;
        }
        removeTempScope() {
            this.clearCurrentTempScope();
            this.tempStackLevel--;
        }
        clearCurrentTempScope() {
            while (this.tempStackTop && this.tempStackTop.top.level > this.tempStackLevel) {
                this.popTempValue();
            }
        }
        hasValueOnCurrentLevel() {
            return this.hasTempValue() && this.tempStackTop.top.level == this.tempStackLevel;
        }
        pushTempValue(value) {
            var newStackField = new TempStackField(this.tempStackLevel);
            newStackField.setValue(value);
            this.tempStackTop = DS.Stack.push(newStackField, this.tempStackTop);
            this.observer.addFieldToTempStack(newStackField);
        }
        pushTempAlias(field) {
            var value = field.getValue();
            this.pushTempValue(new TS.Alias(new TS.ReferenceClass(value.prototype), field));
        }
        popTempValue() {
            var field = DS.Stack.top(this.tempStackTop);
            this.tempStackTop = DS.Stack.pop(this.tempStackTop);
            this.observer.removeFieldFromTempStack(field);
            if (field.getValue() instanceof TS.Alias)
                return field.getValue().reference;
            else
                return field;
        }
        isTempValueAlias() {
            return this.tempStackTop.top.getValue() instanceof TS.Alias;
        }
        passTempValue() {
            if (this.hasTempValue())
                this.tempStackTop.top.level = this.tempStackLevel;
            else
                this.pushTempValue(TS.Void.classInstance.defaultValue());
        }
        hasTempValue() {
            return this.tempStackTop != null;
        }
        foreachStackFields(func) {
            var scopes = this.stack.getScopes();
            while (scopes) {
                DS.Stack.forAll(scopes.top.stack, func);
                scopes = scopes.tail;
            }
        }
        foreachTempStackFields(func) {
            var tempStack = this.tempStackTop;
            while (tempStack) {
                func(tempStack.top);
                tempStack = tempStack.tail;
            }
        }
        foreachHeapFields(func) {
            var heap = this.heap;
            while (heap) {
                func(heap.top);
                heap = heap.tail;
            }
        }
        foreachMemoryFields(func) {
            this.foreachStackFields(func);
            this.foreachTempStackFields(func);
            this.foreachHeapFields(func);
        }
    }
    Memory.Environment = Environment;
    (function (FlowState) {
        FlowState[FlowState["NormalFlow"] = 0] = "NormalFlow";
        FlowState[FlowState["Return"] = 1] = "Return";
        FlowState[FlowState["Break"] = 2] = "Break";
        FlowState[FlowState["Continue"] = 3] = "Continue";
    })(Memory.FlowState || (Memory.FlowState = {}));
    var FlowState = Memory.FlowState;
    class MemoryField {
        constructor() {
            this.references = DS.Stack.empty();
        }
        setValue(val) {
            this.value = val;
            this.observer.setFieldValue(val);
            return this;
        }
        getValue() {
            return this.value;
        }
        referencedBy(ref) {
            this.references = DS.Stack.push(ref, this.references);
        }
        unreferencedBy(ref) {
            this.references = DS.Stack.remove(ref, this.references);
        }
        getReferences() {
            return this.references;
        }
    }
    Memory.MemoryField = MemoryField;
    class StackField extends MemoryField {
        constructor(name) {
            super();
            this.name = name;
            this.observer = new MO.StackFieldObserver(this);
        }
    }
    Memory.StackField = StackField;
    class TempStackField extends MemoryField {
        constructor(level) {
            super();
            this.level = level;
            this.observer = new MO.TempStackFieldObserver(this);
        }
    }
    Memory.TempStackField = TempStackField;
    class AliasTempStackField extends TempStackField {
        constructor(level) {
            super(level);
            this.level = level;
            this.observer = new MO.TempStackFieldObserver(this);
        }
    }
    Memory.AliasTempStackField = AliasTempStackField;
    class HeapField extends MemoryField {
        constructor() {
            super();
            this.observer = new MO.HeapFieldObserver(this);
        }
    }
    Memory.HeapField = HeapField;
    class StackScope extends DS.Scope {
        constructor(name) {
            super();
            this.name = name;
            this.observer = new MO.ScopeObserver(this);
        }
    }
    Memory.StackScope = StackScope;
})(Memory || (Memory = {}));
var Compiler;
(function (Compiler) {
    class TypeEnvironment {
        constructor() {
            this.stack = new DS.StackMap();
            this.closures = [];
            this.namesOnStack = DS.Stack.empty();
            this.contexts = DS.Stack.empty();
            this.functionsExpections = DS.Stack.empty();
            this.addScope();
        }
        addClosure() {
            this.closures.push({});
        }
        removeClosure() {
            return this.closures.pop();
        }
        addElement(name, typ) {
            var newElement = new TypeField(name, typ, this.closures.length - 1);
            this.stack.addElement(newElement);
            this.namesOnStack = DS.Stack.push(new NamedType(name, typ), this.namesOnStack);
        }
        addScope() {
            var scope = new TypeScope();
            this.stack.addScope(scope);
        }
        removeScope() {
            var removedScope = this.stack.removeScope();
            var removedScopeStack = removedScope.stack;
            while (removedScopeStack) {
                this.namesOnStack = this.namesOnStack.tail;
                removedScopeStack = removedScopeStack.tail;
            }
        }
        getElement(name) {
            var toGet = this.stack.getElement(name);
            if (!toGet)
                return null;
            for (var i = toGet.level + 1; i < this.closures.length; i++) {
                this.closures[i][toGet.name] = toGet.typ;
            }
            return toGet;
        }
        getNamesOnStack() {
            return this.namesOnStack;
        }
        addContext(context) {
            this.contexts = DS.Stack.push(context, this.contexts);
        }
        removeContext() {
            this.contexts = DS.Stack.pop(this.contexts);
        }
        static isInContextRec(context, contexts) {
            if (!contexts)
                return false;
            var topContext = contexts.top;
            if (context == Context.Loop && topContext == Context.Loop)
                return true;
            if (context == Context.Function && topContext == Context.Function)
                return true;
            if (context == Context.Function)
                return TypeEnvironment.isInContextRec(context, contexts.tail);
            return false;
        }
        isInContext(context) {
            return TypeEnvironment.isInContextRec(context, this.contexts);
        }
        addFunctionExpection(expection) {
            this.functionsExpections = DS.Stack.push(expection, this.functionsExpections);
        }
        removeFunctionExpection() {
            this.functionsExpections = DS.Stack.pop(this.functionsExpections);
        }
        getFunctionExpection() {
            return this.functionsExpections.top;
        }
    }
    Compiler.TypeEnvironment = TypeEnvironment;
    (function (FlowState) {
        FlowState[FlowState["Normal"] = 0] = "Normal";
        FlowState[FlowState["Break"] = 1] = "Break";
        FlowState[FlowState["Return"] = 2] = "Return";
    })(Compiler.FlowState || (Compiler.FlowState = {}));
    var FlowState = Compiler.FlowState;
    (function (Context) {
        Context[Context["Function"] = 0] = "Function";
        Context[Context["Loop"] = 1] = "Loop";
    })(Compiler.Context || (Compiler.Context = {}));
    var Context = Compiler.Context;
    class TypeScope extends DS.Scope {
    }
    class NamedType {
        constructor(name, typ) {
            this.name = name;
            this.typ = typ;
        }
    }
    Compiler.NamedType = NamedType;
    class TypeField extends NamedType {
        constructor(name, typ, level) {
            super(name, typ);
            this.level = level;
        }
    }
})(Compiler || (Compiler = {}));
var GUI;
(function (GUI) {
    function empty(element = 'div') {
        return $('<' + element + '></' + element + '>');
    }
    GUI.empty = empty;
    function showPlaceholder(dropFields, size) {
        dropFields.css('min-height', size);
        if (size == 19)
            dropFields.addClass('hoveredPlaceholder');
        else
            dropFields.removeClass('hoveredPlaceholder');
    }
    GUI.showPlaceholder = showPlaceholder;
    function hideAllPlaceholders() {
        $('.dropListPlaceholder, .dropField').css('min-height', 0).css('height', '').css('width', '').removeClass('hoveredPlaceholder');
    }
    GUI.hideAllPlaceholders = hideAllPlaceholders;
    function focusOn(element) {
        element.addClass('underEdition');
        element.focus();
        document.execCommand('selectAll', false, null);
    }
    GUI.focusOn = focusOn;
    function makeEditable(element, removable, keydown = () => { }, keyup = () => { return true; }, edited = () => { }) {
        element.attr('contenteditable', 'true');
        element.attr('spellcheck', 'false');
        element.addClass('contenteditable');
        element.click((e) => {
            if (!isEditable(element))
                return true;
            var event = e.originalEvent;
            if (event.editableHandled)
                return true;
            event.editableHandled = true;
            e.stopPropagation();
            element.focus();
            document.execCommand('selectAll', false, null);
        });
        element.keydown((e) => {
            if (!isEditable(element))
                return true;
            var event = e.originalEvent;
            if (event.editableHandled)
                return true;
            event.editableHandled = true;
            keydown(e);
            if (e.which == 13 || e.which == 9 || e.which == 38 || e.which == 40) {
                e.preventDefault();
            }
        });
        element.keyup((e) => {
            if (!isEditable(element))
                return true;
            var event = e.originalEvent;
            if (event.editableHandled)
                return true;
            event.editableHandled = true;
            if (!element.hasClass('underEdition'))
                return;
            if (!keyup(e))
                return;
            if (e.which == 13 || e.which == 9 || e.which == 38 || e.which == 40) {
                var inputs = $("#codeField [contenteditable='true']");
                var index;
                if (e.which == 13 || e.which == 9 || e.which == 40) {
                    index = inputs.index(element) + 1;
                    if (index >= inputs.length)
                        index = 0;
                }
                else {
                    index = inputs.index(element) - 1;
                    if (index < 0)
                        index = inputs.length - 1;
                }
                var next = inputs.eq(index);
                element.blur();
                focusOn(next);
            }
        });
        element.focus(() => {
            element.addClass('underEdition');
        });
        element.blur(() => {
            element.removeClass('underEdition');
            if (isEditable(element))
                edited();
        });
    }
    GUI.makeEditable = makeEditable;
    class ElementHelper {
        constructor(helper) {
            this.helper = helper;
            this.element = $('<div></div>').addClass('elementHelper');
            this.holder = $('<div></div>').addClass('helperHolder');
            this.element.append(this.holder);
            this.holder.append(helper.getElement());
        }
        getElement() {
            return this.element;
        }
        getHelper() {
            return this.helper;
        }
    }
    GUI.ElementHelper = ElementHelper;
    class StringHelper {
        constructor(name, description) {
            this.name = name;
            this.description = description;
            this.element = $('<div></div>').addClass('stringHelper');
            this.nameElement = $('<div></div>').addClass('stringHelperName');
            this.descriptionElement = $('<div></div>').addClass('stringHelperDescription');
            this.element.append(this.nameElement);
            this.element.append(this.descriptionElement);
            this.nameElement.text(name);
            this.descriptionElement.text(description);
        }
        getElement() {
            return this.element;
        }
    }
    GUI.StringHelper = StringHelper;
    class EditableHelpersList {
        constructor() {
            this.element = $('<div></div>').addClass('elementHelpersList');
            this.currentHelpers = [];
            this.currnet = 0;
            this.hovered = null;
            $('body').append(this.element);
            window.setInterval(() => {
                this.updateOffset(true);
            }, 1000);
        }
        getElement() {
            return this.element;
        }
        clear() {
            this.element.empty();
        }
        fill(currentHelpers) {
            this.clear();
            this.currentHelpers = currentHelpers;
            for (var i in currentHelpers) {
                var helper = currentHelpers[i];
                this.element.append(helper.getElement());
            }
            this.element.append($('<div></div>').addClass('hintSeparator'));
            var hint1 = $('<div></div>').addClass('hint').html('Press &#8593; or &#8595; to navigate');
            var hint2 = $('<div></div>').addClass('hint').html('Press [Tab] or [Enter] to select');
            this.element.append(hint1).append(hint2);
            this.currnet = -1;
            this.setCurrentIndex(0);
        }
        getCurrent() {
            if (!this.currentHelpers.length)
                throw 'No helper to return';
            return this.currentHelpers[this.currnet];
        }
        incrementSelectedIndex() {
            if (!this.currentHelpers.length)
                return;
            this.setCurrentIndex(this.currnet + 1);
        }
        decrementSelectedIndex() {
            if (!this.currentHelpers.length)
                return;
            this.setCurrentIndex(this.currnet - 1);
        }
        setCurrentIndex(index) {
            if (this.currnet >= 0) {
                this.currentHelpers[this.currnet].getElement().removeClass('selected');
            }
            if (index < 0)
                index = this.currentHelpers.length - 1;
            if (index >= this.currentHelpers.length)
                index = 0;
            this.currnet = index;
            this.currentHelpers[this.currnet].getElement().addClass('selected');
        }
        hide() {
            this.hovered = null;
            this.element.hide();
        }
        focusOn(hovered) {
            if (this.hovered != hovered) {
                this.hovered = hovered;
                this.updateOffset();
                this.element.show();
            }
        }
        updateOffset(animated = false) {
            if (this.hovered) {
                var offset = this.hovered.offset();
                offset.top += this.hovered.outerHeight();
                var thisOffset = this.element.offset();
                if (offset.top != thisOffset.top || offset.left != thisOffset.left)
                    this.element.stop().animate({
                        top: offset.top,
                        left: offset.left
                    }, animated ? 200 : 0);
            }
        }
    }
    var _editableHelpersList;
    function getEditableHelpersList() {
        if (!_editableHelpersList)
            _editableHelpersList = new EditableHelpersList();
        return _editableHelpersList;
    }
    function makeEditableWithHelpers(editable, removable, source, keydown = () => { }, keyup = () => { return true; }, edited = () => { }) {
        var textChanged = false;
        makeEditable(editable, removable, (e) => {
            keydown(e);
        }, (e) => {
            if (!keyup(e))
                return false;
            var helpersList = getEditableHelpersList();
            var text = editable.text();
            var hasContent = text != "";
            textChanged = textChanged || (e.which != 38 && e.which != 40 && e.which != 13 && e.which != 9);
            if (textChanged && hasContent) {
                helpersList.focusOn(editable);
                if (e.which == 38) {
                    helpersList.decrementSelectedIndex();
                    return false;
                }
                if (e.which == 40) {
                    helpersList.incrementSelectedIndex();
                    return false;
                }
                if (e.which == 13 || e.which == 9) {
                    editable.blur();
                    return false;
                }
                helpersList.fill(source.getHelpers(text));
            }
            else {
                textChanged = false;
                getEditableHelpersList().hide();
            }
            return true;
        }, () => {
            edited();
            var helpersList = getEditableHelpersList();
            var index = $("#codeField [contenteditable='true']").index(editable);
            var hasContent = editable.text() != "";
            helpersList.hide();
            if (textChanged && hasContent) {
                source.helperSelected(helpersList.getCurrent());
                var input = editable.find("[contenteditable='true']").first();
                if (input.length)
                    focusOn(input);
                else if (editable.attr('contenteditable')) {
                    focusOn($("#codeField [contenteditable='true']").eq(index + 1));
                }
                else {
                    focusOn($("#codeField [contenteditable='true']").eq(index));
                }
            }
            textChanged = false;
            helpersList.clear();
        });
    }
    GUI.makeEditableWithHelpers = makeEditableWithHelpers;
    function setEditable(element, editable = true) {
        if (editable)
            element.attr('contenteditable', 'true');
        else {
            element.removeAttr('contenteditable');
            element.removeClass('underEdition');
        }
    }
    GUI.setEditable = setEditable;
    function isEditable(element) {
        return element.attr('contenteditable') == 'true';
    }
    GUI.isEditable = isEditable;
    function addDynamicEvants(elem) {
    }
    GUI.addDynamicEvants = addDynamicEvants;
    function addStaticEvents(elem) {
        elem.find('.codeElement').addBack('.codeElement').draggable({
            stack: '.codeElement',
            helper: function () {
                return $(this).clone().css("pointer-events", "none").appendTo("body").show();
            },
            opacity: 0.5,
            start: function (event, ui) {
                $(this).css('pointer-events', 'none');
                $(this).css('opacity', '0.5');
            },
            drag: function (event, ui) {
                $(this).css('bottom', '');
                $(this).css('right', '');
                $(this).css('width', '');
                $(this).css('height', '');
                $(this).parent().css('width', $(this).css('width'));
                $(this).parent().css('height', $(this).outerHeight());
            },
            stop: function (event, ui) {
                $(this).css({ 'pointer-events': 'auto', left: 0, top: 0 });
                $(this).css('opacity', '1');
                $(this).css('bottom', '');
                $(this).css('right', '');
                $(this).css('width', '');
                $(this).css('height', '');
                $(this).parent().css('width', '');
                $(this).parent().css('height', '');
            },
            scroll: false,
        });
    }
    GUI.addStaticEvents = addStaticEvents;
    function getRawData(elem) {
        return elem.text();
    }
    GUI.getRawData = getRawData;
    function extractElement(element) {
        return element.data(Commons.data_ElementObject);
    }
    GUI.extractElement = extractElement;
    class StackElement {
        constructor(name) {
            this.name = name;
            this.element = $('<div></div>');
            this.element.addClass('onStackElement');
            this.elementName = $('<div></div>');
            this.elementName.addClass('onStackElementName');
            this.elementEqual = $('<div>=</div>');
            this.elementValue = $('<div></div>');
            this.elementValue.addClass('onStackElementValue');
            this.elementName.append(name);
            this.element.append(this.elementName);
            this.element.append(this.elementEqual);
            this.element.append(this.elementValue);
        }
        addValue(value) {
            this.elementValue.empty();
            this.elementValue.append(value);
        }
    }
    GUI.StackElement = StackElement;
    class HeapElement {
        constructor() {
            this.element = $('<div></div>');
            this.element.addClass('onHeapElement');
            this.elementValue = $('<div></div>');
            this.elementValue.addClass('onHeapElementValue');
            this.element.append(this.elementValue);
        }
        addValue(value) {
            this.elementValue.empty();
            this.elementValue.append(value);
        }
    }
    GUI.HeapElement = HeapElement;
    function getObjectElementForSimpleType(value) {
        var element = $('<div></div>');
        element.addClass('objectElement');
        element.append(value);
        return element;
    }
    GUI.getObjectElementForSimpleType = getObjectElementForSimpleType;
    function getObjectElementForFunction() {
        var element = $('<div></div>');
        element.addClass('objectElement');
        element.text('<fun>');
        return element;
    }
    GUI.getObjectElementForFunction = getObjectElementForFunction;
    function getObjectElementForType() {
        var element = $('<div></div>');
        element.addClass('objectElement');
        element.text('<type>');
        return element;
    }
    GUI.getObjectElementForType = getObjectElementForType;
    function getObjectElementForReference(reference) {
        var element = $('<div></div>');
        element.addClass('objectElement');
        var canvas = $('<canvas></canvas>');
        canvas.addClass('connection');
        element.append(canvas);
        element.append('o');
        var context = canvas.get(0).getContext('2d');
        context.canvas.height = window.outerHeight;
        context.canvas.width = window.outerWidth;
        context.beginPath();
        context.moveTo(element.offset().left, element.offset().top);
        context.lineTo(reference.offset().left, reference.offset().top);
        context.lineCap = 'round';
        context.strokeStyle = '#ff0000';
        context.lineWidth = 15;
        context.stroke();
        return element;
    }
    GUI.getObjectElementForReference = getObjectElementForReference;
    function linkObjects(canvas, first, second) {
    }
    GUI.linkObjects = linkObjects;
    class Scrollable {
        constructor(externalHolder) {
            this.externalHolder = externalHolder;
            this.topOffset = 0;
            var children = externalHolder.children().detach();
            externalHolder.addClass('scrollExternalHolder');
            this.internalHolder = $('<div></div>').addClass('scrollInternalHolder').appendTo(this.externalHolder);
            this.contentWrapper = $('<div></div>').addClass('scrollContentWrapper').append(children).appendTo(this.internalHolder);
            this.scrollBar = $('<div></div>').addClass('scrollBar').appendTo(this.externalHolder);
            this.scrollButton = $('<div></div>').addClass('scrollBarButton').appendTo(this.scrollBar);
            this.scrollButton.draggable({
                stop: (event, ui) => {
                    this.updateUI();
                },
                drag: (event, ui) => {
                    var holderHeight = this.internalHolder.innerHeight();
                    var contentHeight = this.contentWrapper.outerHeight();
                    var scrollbarHeight = this.scrollBar.innerHeight();
                    var buttonHeight = this.scrollButton.outerHeight();
                    var buttonTop = parseFloat(this.scrollButton.css('top'));
                    this.topOffset = contentHeight > holderHeight ?
                        (contentHeight - holderHeight) * buttonTop / (scrollbarHeight - buttonHeight)
                        : 0;
                    ui.position = {
                        'top': Math.max(0, Math.min(ui.position.top, scrollbarHeight - buttonHeight))
                    };
                    this.updateUI();
                },
                scroll: false,
            });
            externalHolder.bind('mousewheel DOMMouseScroll', (e) => {
                var offset = parseInt(this.contentWrapper.css('margin-top'));
                var orginalEvent = e.originalEvent;
                var delta = parseInt(orginalEvent.wheelDelta || -orginalEvent.detail);
                this.topOffset += delta > 0 ? -60 : 60;
                this.updateUI();
            });
            this.updateUI();
        }
        updateUI() {
            var holderHeight = this.internalHolder.innerHeight();
            var contentHeight = this.contentWrapper.outerHeight();
            this.topOffset = Math.min(this.topOffset, contentHeight - holderHeight);
            this.topOffset = Math.max(this.topOffset, 0);
            this.contentWrapper.css('top', -this.topOffset);
            var scrollbarHeight = this.scrollBar.innerHeight();
            var buttonHeight = contentHeight > holderHeight ? scrollbarHeight * holderHeight / contentHeight : scrollbarHeight;
            var buttonOffset = contentHeight > holderHeight ? (scrollbarHeight - buttonHeight) * this.topOffset / (contentHeight - holderHeight) : 0;
            this.scrollButton.outerHeight(buttonHeight);
            this.scrollButton.css('top', buttonOffset);
            if (this.onScroll)
                this.onScroll();
        }
        scrollDown() {
            this.topOffset = this.contentWrapper.outerHeight();
            this.updateUI();
        }
        getContent() {
            return this.contentWrapper;
        }
        getElement() {
            return this.externalHolder;
        }
    }
    GUI.Scrollable = Scrollable;
    class PickableButton {
        constructor(button, indicator, relatedElement) {
            this.button = button;
            this.indicator = indicator;
            this.relatedElement = relatedElement;
            this.selected = true;
        }
    }
    class Pickable {
        constructor(externalHolder) {
            this.externalHolder = externalHolder;
            this.buttonsPerRow = 4;
            this.options = [];
            this.buttonsHolders = [];
            this.selectedIndex = -1;
            externalHolder.empty();
            externalHolder.addClass('pickerExternalHolder');
            this.selectionIndicator = $('<div></div>');
            this.selectionIndicator.addClass('pickerIndicator');
            this.pickerHolder = $('<div></div>').addClass('pickerHeader');
            this.externalHolder.append(this.pickerHolder);
            this.pickerContent = $('<div></div>').addClass('pickerContent');
            this.externalHolder.append(this.pickerContent);
            this.pickerHolder.append(this.selectionIndicator);
        }
        getElement() {
            return this.externalHolder;
        }
        updateUI() {
            if (this.selectedIndex != -1)
                this.options[this.selectedIndex].relatedElement.updateUI();
        }
        addPickable(name, element) {
            var buttonsHolder;
            if (this.options.length % this.buttonsPerRow == 0) {
                buttonsHolder = $('<div></div>');
                buttonsHolder.addClass('pickerHolder');
                this.buttonsHolders.push(buttonsHolder);
                this.selectionIndicator.before(buttonsHolder);
            }
            else {
                buttonsHolder = this.buttonsHolders[this.buttonsHolders.length - 1];
            }
            this.pickerContent.append(element.getElement());
            var button = $('<div></div>');
            button.addClass('pickerButton');
            var buttonText = $('<div></div>');
            buttonText.addClass('pickerButtonText');
            buttonText.text(name);
            button.append(buttonText);
            var indicator = $('<div></div>');
            indicator.addClass('pickerButtonIndicator');
            button.append(indicator);
            this.options.push(new PickableButton(button, indicator, element));
            var index = this.options.length - 1;
            button.click(() => {
                this.select(index);
            });
            buttonsHolder.append(button);
        }
        select(index) {
            this.selectedIndex = index;
            var row = Math.floor(index / this.buttonsPerRow);
            this.buttonsHolders[row].insertBefore(this.selectionIndicator);
            for (var i = 0; i < this.options.length; i++) {
                var pickable = this.options[i];
                if (i != index) {
                    pickable.relatedElement.getElement().detach();
                    pickable.button.removeClass('pickerButtonSelected');
                    pickable.indicator.hide();
                }
                else {
                    this.pickerContent.append(pickable.relatedElement.getElement());
                    pickable.button.addClass('pickerButtonSelected');
                    pickable.indicator.show();
                    pickable.relatedElement.updateUI();
                }
            }
            this.updateUI();
        }
    }
    GUI.Pickable = Pickable;
    function makeResizable(toResize, horizontal, shouldUpdate = []) {
        var buttonContainer = $('<div></div>').addClass('resizer').insertAfter(toResize);
        var button = $('<div><div></div></div>').addClass('resizable').appendTo(buttonContainer);
        var resizedPrev = buttonContainer.prev();
        var resizedNext = buttonContainer.next();
        var resizePrev = resizedPrev.css('flex') != '1';
        var resizeNext = resizedNext.css('flex') != '1';
        if (horizontal) {
            var left = 'left';
            var width = 'width';
            button.addClass('resizableHor');
        }
        else {
            var left = 'top';
            var width = 'height';
            button.addClass('resizableVer');
        }
        button.draggable({
            stop: (event, ui) => {
                var offset = parseInt(button.css(left));
                button.css(left, 0);
                var prevWidth = (resizedPrev[width]() + offset) / toResize.parent()[width]() * 100 + '%';
                var nextWidth = (resizedNext[width]() - offset) / toResize.parent()[width]() * 100 + '%';
                if (offset >= 0) {
                    if (resizedNext)
                        resizedNext[width](nextWidth);
                    if (resizedPrev)
                        resizedPrev[width](prevWidth);
                }
                else {
                    if (resizedPrev)
                        resizedPrev[width](prevWidth);
                    if (resizedNext)
                        resizedNext[width](nextWidth);
                }
                shouldUpdate.forEach((e) => { e.updateUI(); });
            },
            scroll: false,
        });
    }
    GUI.makeResizable = makeResizable;
    class Console {
        constructor() {
            this._button = $('#consoleSubimt');
            this._input = $('#consoleInput');
            this._holder = $('#consoleInputHolder');
            this._console = new Scrollable($('#consoleLog'));
            this._button.click((e) => {
                var message = this._input.text();
                this._input.empty();
                this.input(message);
                BufferManager.getBuffer().addConsoleInput(message);
                return false;
            });
            this._input.keydown((e) => {
                if (e.which == 13) {
                    this._button.click();
                    e.preventDefault();
                }
            });
        }
        addMessage(message, delimiterChar) {
            var holder = $('<div></div>').addClass('consoleMessage');
            var now = new Date;
            var date = $('<div></div>')
                .addClass('consoleMessageDate')
                .text(now.toTimeString().substr(0, 8));
            holder.append(date);
            var delimiter = $('<div></div>')
                .addClass('consoleMessageDelimiter')
                .text(delimiterChar);
            holder.append(delimiter);
            var text = $('<div></div>')
                .addClass('consoleMessageText')
                .text(message);
            holder.append(text);
            this._console.getContent().append(holder);
            this._console.scrollDown();
            return holder;
        }
        print(message) {
            return this.addMessage(message, '\|').animate({ backgroundColor: '#C0C0C0' }, 100).animate({ backgroundColor: 'transparent' }, 1000);
        }
        input(message) {
            return this.addMessage(message, '>');
        }
        printError(message) {
            return this.print(message).css('color', 'red');
        }
        printSuccess(message) {
            return this.print(message).css('color', 'green');
        }
        printInternalMessage(message) {
            return this.print(message).css('color', 'gray');
        }
        clear() {
            this._console.getContent().empty();
        }
        requestConsoleInput() {
            if (this._holder.queue().length == 0)
                this._holder.animate({ backgroundColor: '#FF4500' }, 100).animate({ backgroundColor: 'transparent' }, 2000).delay(1000);
        }
        updateUI() {
            this._console.updateUI();
        }
    }
    var progremConsole = null;
    function getConsole() {
        if (progremConsole == null)
            progremConsole = new Console();
        return progremConsole;
    }
    GUI.getConsole = getConsole;
    function setAsTrash(element) {
        element.droppable({
            accept: '#codeField .codeElement',
            drop: function (event, ui) {
                var drag = extractElement(ui.draggable);
                drag.detachElement();
                hideAllPlaceholders();
            },
            greedy: true,
            tolerance: 'pointer',
        });
    }
    GUI.setAsTrash = setAsTrash;
    class Help {
        constructor(button) {
            this.element = $('<div></div>').addClass('help');
            this.descriptions = [];
            this.displayed = false;
            button.click(() => this.showHelp());
            this.element.click(() => this.hideHelp());
        }
        showHelp() {
            this.displayed = true;
            this.element.empty();
            for (var i = 0; i < this.descriptions.length; i++) {
                var description = this.descriptions[i];
                var element = $('<div></div>').addClass('helpField');
                element.offset(description.element.offset());
                element.width(description.element.outerWidth());
                element.height(description.element.outerHeight());
                element.append(description.content);
                this.element.append(element);
            }
            $('body').append(this.element);
        }
        hideHelp() {
            this.displayed = false;
            this.element.detach();
            this.element.empty();
        }
        addDescription(relatedElement, content) {
            this.descriptions.push({
                element: relatedElement,
                content: content
            });
        }
    }
    GUI.Help = Help;
    class Indicator {
        constructor(_class) {
            this.element = GUI.empty();
            this.indicator = $('<div></div>').addClass('indicator');
            this.indicator.addClass(_class);
            this.element.append(this.indicator);
            window.setInterval(() => {
                this.updateUI();
            }, 1000);
        }
        indicate(element) {
            this.indicatedElement = element;
            this.updateUI();
        }
        hide() {
            this.indicatedElement = null;
            this.updateUI();
        }
        getElement() {
            return this.element;
        }
        updateUI() {
            if (this.indicatedElement) {
                var toIndicate = this.indicatedElement.getElement();
                this.indicator.css('opacity', 0.4);
                this.indicator.offset(toIndicate.offset());
                this.indicator.outerWidth(toIndicate.outerWidth());
                this.indicator.outerHeight(toIndicate.outerHeight());
                this.indicator.css('border-radius', toIndicate.css('borderTopLeftRadius'));
            }
            else {
                this.indicator.css('opacity', 0.0);
            }
        }
    }
    var executionIndicator;
    function getExecutionIndicator() {
        if (executionIndicator == null)
            executionIndicator = new Indicator('executionIndicator');
        return executionIndicator;
    }
    GUI.getExecutionIndicator = getExecutionIndicator;
    class Slider {
        constructor(min, max, value, onValueChenge) {
            this.min = min;
            this.max = max;
            this.value = value;
            this.onValueChenge = onValueChenge;
            this.holder = $('<div></div>').addClass('sliderHolder');
            this.button = $('<div></div>').addClass('sliderButton');
            this.holder.append(this.button);
            this.button.draggable({
                stop: (event, ui) => {
                    var left = this.button.position().left;
                    var width = this.holder.width();
                    this.value = min + (max - min) * left / width;
                    onValueChenge(this.value);
                },
                scroll: false,
                containment: 'parent'
            });
            this.button.css('left', ((value - min) * 100 / (max - min)) + '%');
            onValueChenge(value);
        }
        getElement() {
            return this.holder;
        }
    }
    GUI.Slider = Slider;
    class CheckBox {
        constructor(value, onValueChenge) {
            this.value = value;
            this.onValueChenge = onValueChenge;
            this.button = $('<div></div>').addClass('checkBoxButton');
            this.tick = $('<p class="glyphicon glyphicon-ok"></p>').addClass('checkBoxButtonTick');
            this.button.append(this.tick);
            this.button.click(() => {
                this.setValue(!this.value);
            });
            this.setValue(value);
        }
        setValue(value) {
            this.value = value;
            if (this.value)
                this.tick.show();
            else
                this.tick.hide();
            this.onValueChenge(value);
        }
        getElement() {
            return this.button;
        }
    }
    GUI.CheckBox = CheckBox;
    class ElementInfo {
        constructor() {
            this.hovered = null;
            this.element = $('<div></div>');
            this.element.addClass('elementInfo');
            $('body').append(this.element);
            window.setInterval(() => {
                this.updateOffser(true);
            }, 1000);
        }
        hideInfo() {
            this.hovered = null;
            this.element.hide();
        }
        infoFor(hovered) {
            if (this.hovered != hovered) {
                this.hovered = hovered;
                this.element.empty();
                var text = hovered.getDescription();
                var errors = hovered.getErrors();
                if (text == '' && errors.length == 0) {
                    this.hideInfo();
                    return;
                }
                var description = $('<div></div>').addClass('standardInfo');
                description.text(text);
                this.element.append(description);
                for (var i = 0; i < errors.length; i++) {
                    var error = $('<div></div>').addClass('errorInfo');
                    error.text(errors[i]);
                    this.element.append(error);
                }
                this.updateOffser();
                this.element.show();
            }
        }
        updateOffser(animated = false) {
            if (this.hovered) {
                var offset = this.hovered.getElement().offset();
                offset.top += this.hovered.getElement().outerHeight();
                var thisOffset = this.element.offset();
                if (offset.top != thisOffset.top || offset.left != thisOffset.left)
                    this.element.stop().animate({
                        top: offset.top,
                        left: offset.left
                    }, animated ? 200 : 0);
            }
        }
    }
    var elementInfo = null;
    function getElementInfo() {
        if (!elementInfo)
            elementInfo = new ElementInfo();
        return elementInfo;
    }
    GUI.getElementInfo = getElementInfo;
    function disableMenuButton(button) {
        button.addClass('menuButtonDisabled');
    }
    GUI.disableMenuButton = disableMenuButton;
    function enableMenuButton(button) {
        button.removeClass('menuButtonDisabled');
    }
    GUI.enableMenuButton = enableMenuButton;
    function svgElement(tagName) {
        return $(document.createElementNS("http://www.w3.org/2000/svg", tagName));
    }
    GUI.svgElement = svgElement;
})(GUI || (GUI = {}));
var BufferManager;
(function (BufferManager_1) {
    class BufferManager {
        constructor() {
            this._consoleInput = [];
        }
        hasCopiedElement() {
            return !!this._copiedElement;
        }
        copyElement(element) {
            this._copiedElement = element.toJSONObject();
        }
        getCopy() {
            if (!this.hasCopiedElement())
                throw 'No element in buffer';
            return Serializer.deserialize(this._copiedElement);
        }
        clearSelection() {
            if (this._selectedElement)
                this._selectedElement.getElement().removeClass('selectedElement');
            this._selectedElement = null;
        }
        setSelectedElement(element) {
            this.clearSelection();
            this._selectedElement = element;
            this._selectedElement.getElement().addClass('selectedElement');
        }
        getSelectedElement() {
            return this._selectedElement;
        }
        hasSelectedElement() {
            return !!this._selectedElement;
        }
        addConsoleInput(message) {
            this._consoleInput.push(message);
        }
        hasConsoleInput() {
            return this._consoleInput.length > 0;
        }
        getConsoleInput() {
            return this._consoleInput.shift();
        }
        requestConsoleInput() {
            GUI.getConsole().requestConsoleInput();
        }
        clearInputBuffer() {
            this._consoleInput = [];
        }
    }
    var _bufferManager = new BufferManager;
    function getBuffer() {
        if (!_bufferManager)
            _bufferManager = new BufferManager();
        return _bufferManager;
    }
    BufferManager_1.getBuffer = getBuffer;
    $(() => {
        $(document).keydown((e) => {
            var event = e.originalEvent;
            if (event.environmentEditableHandled)
                return true;
            event.environmentEditableHandled = true;
            if (e.keyCode == 67 && e.ctrlKey) {
                var buffer = getBuffer();
                if (buffer.hasSelectedElement())
                    buffer.copyElement(buffer.getSelectedElement());
            }
            if (e.keyCode == 46) {
                var buffer = getBuffer();
                if (buffer.hasSelectedElement()) {
                    var selectedElement = buffer.getSelectedElement();
                    var parent = selectedElement.getElement().parent();
                    selectedElement.detachElement();
                    GUI.focusOn(parent);
                }
            }
        });
        $(document).click((e) => {
            var event = e.originalEvent;
            if (!event || event.elementSelected != 'selected') {
                getBuffer().clearSelection();
            }
        });
    });
})(BufferManager || (BufferManager = {}));
var TS;
(function (TS) {
    var TSO = TypeSystemObserver;
    class RValueOfType {
        constructor(varType) {
            this.varType = varType;
        }
    }
    TS.RValueOfType = RValueOfType;
    class LValueOfType extends RValueOfType {
    }
    TS.LValueOfType = LValueOfType;
    function rValue(type) { return new RValueOfType(type); }
    TS.rValue = rValue;
    function lValue(type) { return new LValueOfType(type); }
    TS.lValue = lValue;
    class EnclosedValue extends L.IDeclaration {
        constructor(name, value) {
            super(name);
            this.name = name;
            this.value = value;
            this.expectsType = null;
            this.value = value.getCopy();
        }
        *createTempValue(environment) {
            environment.pushTempValue(this.value.getCopy());
            yield Operation.memory(this);
            return;
        }
        *instantiate(environment) {
            environment.addValueToStack(environment.popTempValue().getValue(), this.name);
            return;
        }
        *execute(environment) {
            yield* this.createTempValue(environment);
            yield* this.instantiate(environment);
            yield Operation.memory(this);
            return;
        }
    }
    TS.EnclosedValue = EnclosedValue;
    class ImplicitDeclaration extends L.IDeclaration {
        constructor(name, expectsType, prototype) {
            super(name);
            this.name = name;
            this.expectsType = expectsType;
            this.prototype = prototype;
        }
        *createTempValue(environment) {
            if (this.expectsType instanceof RValueOfType) {
                environment.pushTempValue(this.prototype.defaultValue());
            }
            else {
                throw 'Cannot declare alias. Alias field has to be defined as well.';
            }
            return;
        }
        *instantiate(environment) {
            if (this.expectsType instanceof RValueOfType) {
                environment.addValueToStack(environment.popTempValue().getValue().getCopy(), this.name);
            }
            else {
                environment.addAliasToStack(environment.popTempValue(), this.name);
            }
            return;
        }
        *execute(environment) {
            yield* this.createTempValue(environment);
            yield* this.instantiate(environment);
            yield Operation.memory(this);
            return;
        }
    }
    TS.ImplicitDeclaration = ImplicitDeclaration;
    class Obj {
        getCopy() { return new Obj(); }
    }
    TS.Obj = Obj;
    class Type {
        getTypeName() {
            return "";
        }
        assignalbeTo(second) {
            return false;
        }
    }
    TS.Type = Type;
    class Instance extends Obj {
        constructor(prototype) {
            super();
            this.prototype = prototype;
        }
        hasMethod(name) {
            return this.prototype.functions[name] != null;
        }
        getMethod(thisField, name, alaisedThis) {
            return new Method(thisField, this.prototype.functions[name], alaisedThis);
        }
        getCopy() { return this.prototype.defaultValue(); }
        *construct(environment) {
            return;
        }
    }
    TS.Instance = Instance;
    class InstanceType extends Type {
        constructor(prototypeType) {
            super();
            this.prototypeType = prototypeType;
        }
        hasMethod(name) {
            return this.prototypeType.hasMethod(name);
        }
        getTypeName() {
            return this.prototypeType.instanceName;
        }
    }
    TS.InstanceType = InstanceType;
    class Prototype extends Obj {
        constructor(functions) {
            super();
            this.functions = functions;
            this.observer = new TSO.PrototypeObserver(this);
        }
        getCopy() {
            return new Prototype(this.functions);
        }
        defaultValue() {
            return new Instance(this);
        }
    }
    TS.Prototype = Prototype;
    class PrototypeType extends Type {
        constructor(instanceName, functions) {
            super();
            this.instanceName = instanceName;
            this.functions = functions;
        }
        hasMethod(name) {
            return this.functions[name] != null;
        }
        declaresType() {
            return new InstanceType(this);
        }
        getTypeName() {
            return 'type ' + this.instanceName;
        }
    }
    TS.PrototypeType = PrototypeType;
    class ClassField extends Memory.MemoryField {
        constructor(declaration, name) {
            super();
            this.declaration = declaration;
            this.name = name;
            this.observer = new TSO.ClassFieldObserver(this);
        }
    }
    TS.ClassField = ClassField;
    class ClassFieldType {
        constructor(name, typ) {
            this.name = name;
            this.typ = typ;
        }
    }
    TS.ClassFieldType = ClassFieldType;
    class FunctionParapeterType {
        constructor(name, paramType, hasDefaultValue) {
            this.name = name;
            this.paramType = paramType;
            this.hasDefaultValue = hasDefaultValue;
        }
    }
    TS.FunctionParapeterType = FunctionParapeterType;
    class Class extends Prototype {
        constructor(classType, fields, functions) {
            super(functions);
            this.classType = classType;
            this.fields = fields;
        }
        getCopy() {
            return new Class(this.classType, this.fields, this.functions);
        }
        defaultValue() {
            return new ClassObject(this);
        }
    }
    TS.Class = Class;
    class ClassType extends PrototypeType {
        constructor(fields, functions, className) {
            super(className, functions);
            this.fields = fields;
        }
        hasField(name) {
            return this.fields[name] != null;
        }
        declaresType() {
            return new ClassObjectType(this);
        }
    }
    TS.ClassType = ClassType;
    class BaseClass extends Class {
        constructor(classType, functions) {
            super(classType, {}, functions);
        }
        getObjectOfValue(value) {
            return new BaseClassObject(this, value);
        }
    }
    TS.BaseClass = BaseClass;
    class ClassObjectField extends Memory.MemoryField {
        constructor(value, name) {
            super();
            this.name = name;
            this.observer = new TSO.ClassFieldObserver(this);
            this.setValue(value);
        }
    }
    TS.ClassObjectField = ClassObjectField;
    class ClassObject extends Instance {
        constructor(prototype) {
            super(prototype);
            this.prototype = prototype;
            this.observer = new TSO.ClassObjectObserver(this);
            this.fields = {};
        }
        *construct(environment) {
            var classFields = this.prototype.fields;
            for (var name in classFields) {
                var classField = classFields[name];
                var declaration = classField.declaration;
                yield* declaration.createTempValue(environment);
                var value = environment.popTempValue().getValue();
                this.fields[name] = new ClassObjectField(value, classField.name);
            }
            return;
        }
        getCopy() {
            var newObject = new ClassObject(this.prototype);
            var fields = this.prototype.fields;
            for (var fieldName in this.fields) {
                var field = this.fields[fieldName];
                newObject.fields[fieldName] = new ClassObjectField(field.getValue().getCopy(), field.name);
            }
            return newObject;
        }
        hasFieldValue(name) {
            return this.fields[name] != null;
        }
        getFieldValue(name) {
            return this.fields[name];
        }
    }
    TS.ClassObject = ClassObject;
    class ClassObjectType extends InstanceType {
        constructor(prototypeType) {
            super(prototypeType);
            this.prototypeType = prototypeType;
        }
        assignalbeTo(second) {
            return (second instanceof ClassObjectType) && (this.prototypeType == second.prototypeType);
        }
    }
    TS.ClassObjectType = ClassObjectType;
    class VoidObject extends ClassObject {
        constructor(prototye) {
            super(prototye);
            this.prototye = prototye;
            this.observer = new TSO.VoidObjectObserver(this);
        }
        getCopy() {
            return new VoidObject(this.prototye);
        }
    }
    TS.VoidObject = VoidObject;
    class BaseClassObject extends ClassObject {
        constructor(prototye, rawValue) {
            super(prototye);
            this.prototye = prototye;
            this.rawValue = rawValue;
            this.observer = new TSO.BaseClassObjectObserver(this);
        }
        getCopy() {
            return new BaseClassObject(this.prototye, this.rawValue);
        }
    }
    TS.BaseClassObject = BaseClassObject;
    class FunctionClass extends Prototype {
        constructor() {
            super({});
        }
    }
    TS.FunctionClass = FunctionClass;
    class FunctionClassType extends PrototypeType {
        constructor(parameters, returnType) {
            super('(' + parameters.map(e => e.paramType.varType.getTypeName()).join(', ') + ') => ' + returnType.varType.getTypeName(), {});
            this.parameters = parameters;
            this.returnType = returnType;
        }
        declaresType() {
            return new FunctionType(this);
        }
    }
    TS.FunctionClassType = FunctionClassType;
    class FunctionObject extends Instance {
        constructor(prototype, parameters, behaviour, closure = []) {
            super(prototype);
            this.prototype = prototype;
            this.parameters = parameters;
            this.behaviour = behaviour;
            this.closure = closure;
            this.observer = new TSO.FunctionObserver(this);
        }
        *call(environment, passedArguments) {
            environment.addScope('Function Call');
            for (var i = 0; i < this.closure.length; i++) {
                var enclosedValue = this.closure[i];
                yield* enclosedValue.execute(environment);
            }
            for (var i = 0; i < this.parameters.length; i++) {
                yield* this.parameters[i].instantiate(environment);
            }
            yield* this.behaviour(environment);
            environment.removeScope();
            return;
        }
        getCopy() {
            return new FunctionObject(this.prototype, this.parameters, this.behaviour, this.closure);
        }
    }
    TS.FunctionObject = FunctionObject;
    class FunctionType extends InstanceType {
        constructor(prototypeType) {
            super(prototypeType);
            this.prototypeType = prototypeType;
        }
    }
    TS.FunctionType = FunctionType;
    class Method extends FunctionObject {
        constructor(thisField, baseFunction, alaisedThis) {
            var thisValue = alaisedThis ? null : thisField.getValue().getCopy();
            super(baseFunction.prototype, baseFunction.parameters, alaisedThis ?
                function* (environment) {
                    environment.addAliasToStack(thisField, 'this');
                    yield* baseFunction.behaviour(environment);
                }
                :
                    function* (environment) {
                        environment.addValueToStack(thisValue.getCopy(), 'this');
                        yield* baseFunction.behaviour(environment);
                    }, baseFunction.closure);
        }
    }
    TS.Method = Method;
    class ArrayClass extends Prototype {
        constructor(elementsClass, length) {
            super({});
            this.elementsClass = elementsClass;
            this.length = length;
        }
        defaultValue() {
            return new ArrayObject(this);
        }
    }
    TS.ArrayClass = ArrayClass;
    class ArrayClassType extends PrototypeType {
        constructor(elementsClass) {
            super(elementsClass.declaresType().getTypeName() + '[]', {});
            this.elementsClass = elementsClass;
        }
        declaresType() {
            return new ArrayType(this);
        }
    }
    TS.ArrayClassType = ArrayClassType;
    class ArrayOfLengthClassType extends ArrayClassType {
        constructor(elementsClass, length) {
            super(elementsClass);
            this.length = length;
        }
        declaresType() {
            return new ArrayType(this);
        }
    }
    TS.ArrayOfLengthClassType = ArrayOfLengthClassType;
    class ArrayField extends Memory.MemoryField {
        constructor(value, index) {
            super();
            this.index = index;
            this.observer = new TSO.ArrayFieldObserver(this);
            this.setValue(value);
        }
    }
    TS.ArrayField = ArrayField;
    class ArrayObject extends Instance {
        constructor(prototype) {
            super(prototype);
            this.prototype = prototype;
            this.observer = new TSO.ArrayObjectObserver(this);
            this.values = [];
            for (var i = 0; i < prototype.length; i++) {
                var memoryField = new ArrayField(prototype.elementsClass.defaultValue(), i);
                this.values[i] = memoryField;
            }
        }
        getField(index) {
            return this.values[index];
        }
        getCopy() {
            var newObject = new ArrayObject(this.prototype);
            for (var i = 0; i < this.prototype.length; i++) {
                newObject.getField(i).setValue(this.values[i].getValue().getCopy());
            }
            return newObject;
        }
        *construct(environment) {
            for (var i = 0; i < this.prototype.length; i++)
                yield* this.values[i].getValue().construct(environment);
            return;
        }
    }
    TS.ArrayObject = ArrayObject;
    class ArrayType extends InstanceType {
        constructor(prototypeType) {
            super(prototypeType);
            this.prototypeType = prototypeType;
        }
        assignalbeTo(second) {
            if (!(second instanceof ArrayType))
                return false;
            return this.prototypeType.elementsClass.declaresType().assignalbeTo(second.prototypeType.elementsClass.declaresType());
        }
    }
    TS.ArrayType = ArrayType;
    class ReferenceClassType extends PrototypeType {
        constructor(referencedPrototypeType) {
            super(referencedPrototypeType.instanceName + ' ref', {});
            this.referencedPrototypeType = referencedPrototypeType;
            this.functions['=='] = new FunctionClassType([
                new FunctionParapeterType('b', rValue(this.declaresType()), false)
            ], rValue(TS.Boolean.objectTypeInstance));
            this.functions['!='] = new FunctionClassType([
                new FunctionParapeterType('b', rValue(this.declaresType()), false)
            ], rValue(TS.Boolean.objectTypeInstance));
        }
        declaresType() {
            return new ReferenceType(this);
        }
    }
    TS.ReferenceClassType = ReferenceClassType;
    class ReferenceType extends InstanceType {
        constructor(prototypeType) {
            super(prototypeType);
            this.prototypeType = prototypeType;
        }
        assignalbeTo(second) {
            if (!(second instanceof ReferenceType))
                return false;
            var a = this.prototypeType.referencedPrototypeType.declaresType().assignalbeTo(second.prototypeType.referencedPrototypeType.declaresType());
            var b = this.prototypeType.referencedPrototypeType == Void.typeInstance;
            return a || b;
        }
    }
    TS.ReferenceType = ReferenceType;
    class ReferenceClass extends Prototype {
        constructor(referencedPrototype) {
            super({});
            this.referencedPrototype = referencedPrototype;
            this.functions['=='] = new FunctionObject(new FunctionClass(), [
                new ImplicitDeclaration('b', rValue(null), Int.classInstance)
            ], function* (environment) {
                var a = environment.getFromStack('this').getValue();
                var b = environment.getFromStack('b').getValue();
                var result = Boolean.classInstance.getObjectOfValue(a.reference == b.reference);
                environment.pushTempValue(result);
            });
            this.functions['!='] = new FunctionObject(new FunctionClass(), [
                new ImplicitDeclaration('b', rValue(null), Int.classInstance)
            ], function* (environment) {
                var a = environment.getFromStack('this').getValue();
                var b = environment.getFromStack('b').getValue();
                var result = Boolean.classInstance.getObjectOfValue(a.reference != b.reference);
                environment.pushTempValue(result);
            });
        }
        defaultValue() {
            return new Reference(this, null);
        }
    }
    TS.ReferenceClass = ReferenceClass;
    class Reference extends Instance {
        constructor(prototype, reference) {
            super(prototype);
            this.prototype = prototype;
            this.reference = reference;
            this.observer = new TSO.ReferenceObserver(this);
            if (reference)
                reference.referencedBy(this);
        }
        getCopy() {
            return new Reference(this.prototype, this.reference);
        }
    }
    TS.Reference = Reference;
    class Alias extends Reference {
        constructor(...args) {
            super(...args);
            this.observer = new TSO.AliasObserver(this);
        }
    }
    TS.Alias = Alias;
    class Void extends Class {
        static initialize() {
            if (!Void.initialized) {
                var typeInstance = new ClassType({}, {}, 'void');
                var objectTypeInstance = new ClassObjectType(typeInstance);
                typeInstance.functions = {};
                var classInstance = new Void(typeInstance, {}, {});
                this.typeInstance = typeInstance;
                this.objectTypeInstance = objectTypeInstance;
                this.classInstance = classInstance;
                Void.initialized = true;
            }
        }
        defaultValue() {
            return new VoidObject(this);
        }
    }
    Void.typeInstance = null;
    Void.objectTypeInstance = null;
    Void.classInstance = null;
    Void.initialized = false;
    TS.Void = Void;
    Void.initialize();
    function _base_typeToTypeMethodType(type, returns) {
        return new FunctionClassType([
            new FunctionParapeterType('b', rValue(type), false)
        ], rValue(returns));
    }
    function _base_typeToTypeMethodOperation(operation, alocator) {
        return new FunctionObject(new FunctionClass(), [
            new ImplicitDeclaration('b', rValue(null), null)
        ], function* (environment) {
            var a = environment.getFromStack('this').getValue();
            var b = environment.getFromStack('b').getValue();
            environment.pushTempValue(alocator.getObjectOfValue(operation(a.rawValue, b.rawValue)));
        });
    }
    function _base_toTypeMethodType(returns) {
        return new FunctionClassType([], rValue(returns));
    }
    function _base_toTypeMethodOperation(operation, alocator) {
        return new FunctionObject(new FunctionClass(), [], function* (environment) {
            var a = environment.getFromStack('this').getValue();
            environment.pushTempValue(alocator.getObjectOfValue(operation(a.rawValue)));
        });
    }
    function _base_printMethod(formatter = (a) => a) {
        return new FunctionObject(new FunctionClass(), [], function* (environment) {
            var a = environment.getFromStack('this').getValue();
            GUI.getConsole().print(formatter(a.rawValue));
        });
    }
    function _base_scanMethod(formatter = (a) => a) {
        return new FunctionObject(new FunctionClass(), [], function* (environment) {
            var a = environment.getFromStack('this').getValue();
            environment.removeScope();
            var buffer = BufferManager.getBuffer();
            while (!buffer.hasConsoleInput()) {
                buffer.requestConsoleInput();
                yield Operation.wait();
            }
            var message = buffer.getConsoleInput();
            environment.addScope('');
            a.rawValue = formatter(message);
            a.observer.updateUI();
        });
    }
    class Boolean extends BaseClass {
        static initialize() {
            if (!Boolean.initialized) {
                var typeInstance = new ClassType({}, {}, 'boolean');
                var objectTypeInstance = new ClassObjectType(typeInstance);
                var classInstance = new Boolean(typeInstance, {});
                var _boolToBoolType = _base_typeToTypeMethodType(objectTypeInstance, objectTypeInstance);
                var _toBoolType = _base_toTypeMethodType(objectTypeInstance);
                var _toVoidType = _base_toTypeMethodType(Void.objectTypeInstance);
                typeInstance.functions = {
                    '&&': _boolToBoolType,
                    '||': _boolToBoolType,
                    '!': _toBoolType,
                    'print': _toVoidType,
                    'scan': _toVoidType
                };
                classInstance.functions['&&'] = _base_typeToTypeMethodOperation((a, b) => a && b, classInstance);
                classInstance.functions['||'] = _base_typeToTypeMethodOperation((a, b) => a || b, classInstance);
                classInstance.functions['!'] = _base_toTypeMethodOperation((a) => !a, classInstance);
                classInstance.functions['print'] = _base_printMethod((a) => {
                    return a ? 'true' : 'false';
                });
                classInstance.functions['scan'] = _base_scanMethod((a) => {
                    return a && a != 'false' && a != 'False';
                });
                this.typeInstance = typeInstance;
                this.objectTypeInstance = objectTypeInstance;
                this.classInstance = classInstance;
                Boolean.initialized = true;
            }
        }
        getObjectOfValue(value) {
            return new BaseClassObject(this, value);
        }
        defaultValue() {
            return this.getObjectOfValue(false);
        }
    }
    Boolean.typeInstance = null;
    Boolean.objectTypeInstance = null;
    Boolean.classInstance = null;
    Boolean.initialized = false;
    TS.Boolean = Boolean;
    Boolean.initialize();
    class Int extends BaseClass {
        static initialize() {
            if (!Int.initialized) {
                var typeInstance = new ClassType({}, {}, 'number');
                var objectTypeInstance = new ClassObjectType(typeInstance);
                var classInstance = new Int(typeInstance, {});
                var _intToIntType = _base_typeToTypeMethodType(objectTypeInstance, objectTypeInstance);
                var _intToBooleanType = _base_typeToTypeMethodType(objectTypeInstance, Boolean.objectTypeInstance);
                var _toIntType = _base_toTypeMethodType(objectTypeInstance);
                var _toVoidType = _base_toTypeMethodType(Void.objectTypeInstance);
                typeInstance.functions = {
                    '+': _intToIntType,
                    '-': _intToIntType,
                    '*': _intToIntType,
                    '/': _intToIntType,
                    '%': _intToIntType,
                    '==': _intToBooleanType,
                    '!=': _intToBooleanType,
                    '<': _intToBooleanType,
                    '<=': _intToBooleanType,
                    '>': _intToBooleanType,
                    '>=': _intToBooleanType,
                    'print': _toVoidType,
                    'scan': _toVoidType,
                    '++': _toIntType,
                    '--': _toIntType,
                    '_++': _toIntType,
                    '_--': _toIntType
                };
                classInstance.functions['+'] = _base_typeToTypeMethodOperation((a, b) => a + b, classInstance);
                classInstance.functions['-'] = _base_typeToTypeMethodOperation((a, b) => a - b, classInstance);
                classInstance.functions['*'] = _base_typeToTypeMethodOperation((a, b) => a * b, classInstance);
                classInstance.functions['/'] = _base_typeToTypeMethodOperation((a, b) => a / b, classInstance);
                classInstance.functions['%'] = _base_typeToTypeMethodOperation((a, b) => a % b, classInstance);
                classInstance.functions['=='] = _base_typeToTypeMethodOperation((a, b) => a == b, Boolean.classInstance);
                classInstance.functions['!='] = _base_typeToTypeMethodOperation((a, b) => a != b, Boolean.classInstance);
                classInstance.functions['<'] = _base_typeToTypeMethodOperation((a, b) => a < b, Boolean.classInstance);
                classInstance.functions['<='] = _base_typeToTypeMethodOperation((a, b) => a <= b, Boolean.classInstance);
                classInstance.functions['>'] = _base_typeToTypeMethodOperation((a, b) => a > b, Boolean.classInstance);
                classInstance.functions['>='] = _base_typeToTypeMethodOperation((a, b) => a >= b, Boolean.classInstance);
                classInstance.functions['print'] = _base_printMethod();
                classInstance.functions['scan'] = _base_scanMethod((a) => {
                    var numberValue = parseInt(a);
                    if (isNaN(numberValue))
                        numberValue = 0;
                    return numberValue;
                });
                classInstance.functions['++'] = new FunctionObject(new FunctionClass(), [], function* (environment) {
                    var a = environment.getFromStack('this').getValue();
                    a.rawValue++;
                    environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
                    a.observer.updateUI();
                });
                classInstance.functions['--'] = new FunctionObject(new FunctionClass(), [], function* (environment) {
                    var a = environment.getFromStack('this').getValue();
                    a.rawValue--;
                    environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
                    a.observer.updateUI();
                });
                classInstance.functions['_++'] = new FunctionObject(new FunctionClass(), [], function* (environment) {
                    var a = environment.getFromStack('this').getValue();
                    environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
                    a.rawValue++;
                    a.observer.updateUI();
                });
                classInstance.functions['_--'] = new FunctionObject(new FunctionClass(), [], function* (environment) {
                    var a = environment.getFromStack('this').getValue();
                    environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
                    a.rawValue--;
                    a.observer.updateUI();
                });
                this.typeInstance = typeInstance;
                this.objectTypeInstance = objectTypeInstance;
                this.classInstance = classInstance;
                Int.initialized = true;
            }
        }
        getObjectOfValue(value) {
            return new BaseClassObject(this, value);
        }
        defaultValue() {
            return this.getObjectOfValue(0);
        }
    }
    Int.typeInstance = null;
    Int.objectTypeInstance = null;
    Int.classInstance = null;
    Int.initialized = false;
    TS.Int = Int;
    Int.initialize();
    class String extends BaseClass {
        static initialize() {
            if (!String.initialized) {
                var typeInstance = new ClassType({}, {}, 'string');
                var objectTypeInstance = new ClassObjectType(typeInstance);
                var classInstance = new String(typeInstance, {});
                var _stringToStringType = _base_typeToTypeMethodType(objectTypeInstance, objectTypeInstance);
                var _toIntType = _base_toTypeMethodType(Int.objectTypeInstance);
                var _toVoidType = _base_toTypeMethodType(Void.objectTypeInstance);
                typeInstance.functions = {
                    '+': _stringToStringType,
                    'length': _toIntType,
                    'print': _toVoidType,
                    'scan': _toVoidType
                };
                classInstance.functions['+'] = _base_typeToTypeMethodOperation((a, b) => a + b, classInstance);
                classInstance.functions['length'] = _base_toTypeMethodOperation((a) => a.length, Int.classInstance);
                classInstance.functions['print'] = _base_printMethod();
                classInstance.functions['scan'] = _base_scanMethod();
                this.typeInstance = typeInstance;
                this.objectTypeInstance = objectTypeInstance;
                this.classInstance = classInstance;
                String.initialized = true;
            }
        }
        getObjectOfValue(value) {
            return new BaseClassObject(this, value);
        }
        defaultValue() {
            return this.getObjectOfValue("");
        }
    }
    String.typeInstance = null;
    String.objectTypeInstance = null;
    String.classInstance = null;
    String.initialized = false;
    TS.String = String;
    String.initialize();
})(TS || (TS = {}));
var Errors;
(function (Errors) {
    function IsNotEmpty(element) {
        if (element.is(':empty')) {
            element.addClass('emptyError');
            return false;
        }
        else {
            element.removeClass('emptyError');
            return true;
        }
    }
    Errors.IsNotEmpty = IsNotEmpty;
    function IsOfType(element, typ) {
        if (!element.returns || element.returns.varType != typ) {
            return false;
        }
        else {
            return true;
        }
    }
    Errors.IsOfType = IsOfType;
})(Errors || (Errors = {}));
var Program;
(function (Program) {
    (function (IDEParts) {
        IDEParts[IDEParts["Code"] = 0] = "Code";
        IDEParts[IDEParts["Preview"] = 1] = "Preview";
        IDEParts[IDEParts["Description"] = 2] = "Description";
    })(Program.IDEParts || (Program.IDEParts = {}));
    var IDEParts = Program.IDEParts;
    class ProgramManager {
        constructor(codeField, stack, tempStack, heap, previewField, descriptionField) {
            this.codeField = codeField;
            this.stack = stack;
            this.tempStack = tempStack;
            this.heap = heap;
            this.previewField = previewField;
            this.descriptionField = descriptionField;
            this.currentProgram = new E.Program();
            this.onStart = [];
            this.onDone = [];
            this.codeFieldFrame = this.codeField.closest('.IDEPartPage');
            this.previewFieldFrame = this.previewField.closest('.IDEPartPage');
            this.descriptionFieldFrame = this.descriptionField.closest('.IDEPartPage');
        }
        setProgram(program) {
            this.currentProgram = program;
            this.currentProgram.parent = this;
            var programmElementGUI = this.currentProgram.getElement();
            programmElementGUI.draggable('disable');
            this.codeField.empty();
            this.codeField.append(programmElementGUI);
            this.validate();
        }
        stopAndClearMemory() {
            MemoryObservers.getEnvironmentObserver().clear();
            BufferManager.getBuffer().clearInputBuffer();
            this.exec = null;
            GUI.getExecutionIndicator().hide();
        }
        stop() {
            this.stopAndClearMemory();
            this.sendDone();
        }
        sendDone() {
            for (var i = 0; i < this.onDone.length; i++)
                this.onDone[i]();
        }
        sendStart() {
            for (var i = 0; i < this.onStart.length; i++)
                this.onStart[i]();
        }
        validate() {
            var program = this.currentProgram.constructCode();
            try {
                program.compile(new Compiler.TypeEnvironment());
            }
            catch (e) {
            }
        }
        compile() {
            this.stopAndClearMemory();
            this.typeEnvironment = new Compiler.TypeEnvironment();
            this.environment = new Memory.Environment();
            var program = this.currentProgram.constructCode();
            var success = false;
            try {
                var success = program.compile(new Compiler.TypeEnvironment());
            }
            catch (e) {
                console.log(e);
            }
            if (!success)
                return null;
            return program.run(this.environment);
        }
        step() {
            if (this.exec == null) {
                this.exec = this.compile();
                if (this.exec == null) {
                    GUI.getConsole().printError('Compilation error, see code for more details');
                    return L.OperationType.Done;
                }
                else {
                    GUI.getConsole().printSuccess('Compiled without errors');
                    this.sendStart();
                }
            }
            do {
                try {
                    var next = this.exec.next();
                }
                catch (e) {
                    console.log(e);
                    GUI.getConsole().printError('Execution error: ' + e);
                    this.exec == null;
                    return L.OperationType.Done;
                }
            } while (!next.done && next.value.operationType == L.OperationType.InternalOperation ||
                !next.done && next.value.element && !next.value.element.getObserver().isDisplayingProgress());
            if (next.done) {
                GUI.getExecutionIndicator().hide();
                GUI.getConsole().printSuccess('Done');
                this.exec = null;
                this.sendDone();
                return L.OperationType.Done;
            }
            else {
                if (next.value.element)
                    next.value.element.getObserver().executing();
                return next.value.operationType;
            }
        }
        toJSON() {
            return JSON.stringify(this.currentProgram.toJSONObject());
        }
        detachElement() {
        }
        attachElement(element) { }
        containsElement() { return true; }
        edited() { this.validate(); }
        setPreview(program) {
            var guiElement = program.getElement();
            this.previewField.empty();
            this.previewField.append(guiElement);
        }
        showIDEPart(part) {
            this.codeFieldFrame.hide();
            this.previewFieldFrame.hide();
            this.descriptionFieldFrame.hide();
            switch (part) {
                case IDEParts.Code:
                    this.codeFieldFrame.show();
                    break;
                case IDEParts.Preview:
                    this.previewFieldFrame.show();
                    break;
                case IDEParts.Description:
                    this.descriptionFieldFrame.show();
                    break;
            }
        }
        updateMemoryUI() {
            var environamnt = this.environment;
            if (environamnt)
                environamnt.foreachMemoryFields((field) => field.observer.updateUI());
        }
        disableCodeEdition() {
            this.codeField.addClass('runningProgram');
        }
        enableCodeEdition() {
            this.codeField.removeClass('runningProgram');
        }
    }
    Program.ProgramManager = ProgramManager;
})(Program || (Program = {}));
var MemoryManager;
(function (MemoryManager) {
    function downloadProgram(programManager) {
        var json = programManager.toJSON();
        console.log(json);
        var blob = new Blob([json], {
            type: 'text/plain;charset=utf-8;',
        });
        saveAs(blob, 'My program.txt');
    }
    MemoryManager.downloadProgram = downloadProgram;
    function createUploadForm(programManager) {
        var input = $('<input type="file"/>').change((e) => {
            var file = e.target.files[0];
            if (!file) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                var code = e.target.result;
                try {
                    var program = Serializer.deserialize(JSON.parse(code));
                    if (program instanceof E.Program)
                        programManager.setProgram(program);
                    else
                        throw 'Downloaded element is not a program';
                }
                catch (e) {
                    GUI.getConsole().printError('Selected file is of incorrect type');
                }
            };
            reader.readAsText(file);
        });
        return input;
    }
    MemoryManager.createUploadForm = createUploadForm;
})(MemoryManager || (MemoryManager = {}));
var Serializer;
(function (Serializer) {
    class Serialized {
        constructor(element, params, visible) {
            this.element = element;
            this.params = params;
            this.visible = visible;
        }
    }
    Serializer.Serialized = Serialized;
    function deserialize(serialized) {
        var parameters = serialized.params.map((elem) => {
            if (typeof elem == 'string')
                return elem;
            if (elem instanceof Array) {
                var elements = [];
                for (var i = 0; i < elem.length; i++)
                    elements.push(deserialize(elem[i]));
                return elements;
            }
            return deserialize(elem);
        });
        var element = new (Function.prototype.bind.apply(E[serialized.element], [null].concat(parameters)));
        element.shouldDisplayProgress(serialized.visible);
        return element;
    }
    Serializer.deserialize = deserialize;
    function deserializeArray(serialized) {
        return serialized.map((elem) => deserialize(elem));
    }
    Serializer.deserializeArray = deserializeArray;
})(Serializer || (Serializer = {}));
var MenuInflater;
(function (MenuInflater) {
    class Helper {
        constructor(shortcut, element, example, name, description) {
            this.shortcut = shortcut;
            this.element = element;
            this.example = example;
            this.name = name;
            this.description = description;
        }
    }
    MenuInflater.Helper = Helper;
    function inflate(container, elements, menu) {
        elements.forEach((value) => {
            var helper = $('<div></div>');
            helper.addClass('helper');
            var description = $('<div></div>');
            description.addClass('helperDescription');
            helper.append(description);
            var name = $('<div></div>');
            name.text(value.name);
            description.append(name);
            var questionMark = $('<span class="glyphicon glyphicon glyphicon-question-sign" aria-hidden="true"></span>');
            questionMark.addClass('helperMore');
            description.append(questionMark);
            var helperHolder = $('<div></div>');
            helperHolder.append(value.element.getCopy().getElement());
            helperHolder.addClass('helperHolder');
            helper.append(helperHolder);
            description.click(() => {
                menu.gotoElementPreviw(value);
            });
            container.append(helper);
        });
    }
    function inflateWithValueHelpers(container, menu) {
        inflate(container, valueHelpers, menu);
    }
    MenuInflater.inflateWithValueHelpers = inflateWithValueHelpers;
    function inflateWithFlowHelpers(container, menu) {
        inflate(container, flowHelpers, menu);
    }
    MenuInflater.inflateWithFlowHelpers = inflateWithFlowHelpers;
    function inflateWithVariableHelpers(container, menu) {
        inflate(container, variableHelpers, menu);
    }
    MenuInflater.inflateWithVariableHelpers = inflateWithVariableHelpers;
    function inflateWithMathHelpers(container, menu) {
        inflate(container, mathHelpers, menu);
    }
    MenuInflater.inflateWithMathHelpers = inflateWithMathHelpers;
    function inflateWithFunctionHelpers(container, menu) {
        inflate(container, functionHelpers, menu);
    }
    MenuInflater.inflateWithFunctionHelpers = inflateWithFunctionHelpers;
    function inflateWithClassHelpers(container, menu) {
        inflate(container, typeHelpers, menu);
    }
    MenuInflater.inflateWithClassHelpers = inflateWithClassHelpers;
    function inflateWithOtherHelpers(container, menu) {
        inflate(container, otherHelpers, menu);
    }
    MenuInflater.inflateWithOtherHelpers = inflateWithOtherHelpers;
    function inflateWithAllHelpers(container, menu) {
        inflate(container, MenuInflater.allHelpers, menu);
    }
    MenuInflater.inflateWithAllHelpers = inflateWithAllHelpers;
    var valueHelpers = [
        new Helper('number', new E.RawData('10'), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["foo", { "element": "Int", "params": [], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }]], "visible": true }), 'Number', 'Returns number of provided value.'),
        new Helper('true', new E.True, Serializer.deserialize({ "element": "Program", "params": [[{ "element": "If", "params": [{ "element": "True", "params": [], "visible": true }, []], "visible": true }]], "visible": true }), 'True', 'True boolean value.'),
        new Helper('false', new E.False, Serializer.deserialize({ "element": "Program", "params": [[{ "element": "If", "params": [{ "element": "False", "params": [], "visible": true }, []], "visible": true }]], "visible": true }), 'False', 'False boolean value.'),
        new Helper('""', new E.StringLiteral('Hello'), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "StringLiteral", "params": ["Hello"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["x", { "element": "FunctionCall", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "length"], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }), 'String', 'String literal.'),
        new Helper('null', new E.Null, Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Class", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }]], "visible": true }, { "element": "ReferenceDefinition", "params": ["x", { "element": "RawData", "params": ["Class"], "visible": true }, { "element": "NewHeapObject", "params": [{ "element": "RawData", "params": ["Class"], "visible": true }, []], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["x"], "visible": true }, { "element": "Null", "params": [], "visible": true }], "visible": true }]], "visible": true }), 'Null', 'Null reference value.'),
        new Helper('new', new E.NewHeapObject, Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Class", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }]], "visible": true }, { "element": "ReferenceDefinition", "params": ["foo", { "element": "RawData", "params": ["Class"], "visible": true }, { "element": "NewHeapObject", "params": [{ "element": "RawData", "params": ["Class"], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }), 'New heap object', 'Creates a new object of provided type and places it on the heap.'),
        new Helper('new []', new E.NewArray, Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "NewArray", "params": [{ "element": "Int", "params": [], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'New heap array', 'Creates a new array composed of probided type and places it on the heap.'),
        new Helper('ref of', new E.ReferenceOf, Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }, { "element": "ReferenceDefinition", "params": ["bar", { "element": "Int", "params": [], "visible": true }, { "element": "ReferenceOf", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Reference of', 'Returns a new reference to the provided object.'),
        new Helper('default value', new E.DefaultValue, Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["foo", { "element": "Int", "params": [], "visible": true }, { "element": "DefaultValue", "params": [{ "element": "Int", "params": [], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Default value', 'Returns a new object of the provided type.'),
        new Helper('[]', new E.ElementAt, Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDeclaration", "params": ["foo", { "element": "Array", "params": [{ "element": "Int", "params": [], "visible": true }, "5"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "ElementAt", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, { "element": "RawData", "params": ["3"], "visible": true }], "visible": true }, { "element": "RawData", "params": ["4"], "visible": true }], "visible": true }, { "element": "Print", "params": [{ "element": "ElementAt", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, { "element": "RawData", "params": ["3"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Element at', 'Returns an element that is located under specified index in given array.'),
        new Helper('random', new E.Random, Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "Random", "params": [], "visible": true }], "visible": true }]], "visible": true }), 'Random', 'Yields a random number between 0 and 100.'),
    ];
    var flowHelpers = [
        new Helper('if', new E.If(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["4"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, [{ "element": "Print", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }), 'If', 'Executes given block of instruction, if specified condition is true.'),
        new Helper('if else', new E.IfElse(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["4"], "visible": true }], "visible": true }, { "element": "IfElse", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, [{ "element": "Print", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }], "visible": true }], [{ "element": "Print", "params": [{ "element": "RawData", "params": ["6"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }), 'If-else', 'If specified condition is true, executes the first block of instructions, otherwise executes the second one.'),
        new Helper('while', new E.WhileLoop(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "WhileLoop", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, [{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "Multiply", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["i"], "visible": true }], "visible": true }], "visible": true }, { "element": "Print", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }), 'While loop', 'Basic "while loop" with a condition block. Condition is being evaluated before every iteration and the loop continues to execute only if it\'s value is true.'),
        new Helper('for', new E.ForLoop(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, [{ "element": "Print", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }), 'For loop', 'Basic "for loop" with initialize, condition and step blocks. Initialization happens only once, when the program enters the loop. Condition is being evaluated before every iteration and the loop continues to execute only if it\'s value is true. Step block is being executed after every iteration.'),
        new Helper('for', new E.ForLoop(new E.VariableImplicitDefinition('i', new E.RawData('0')), new E.Less(new E.RawData('i'), new E.RawData('5')), new E.Increment(new E.RawData('i'))), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, [{ "element": "Print", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }), 'For loop', 'Pre-filled for loop.'),
        new Helper('{}', new E.Block(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["2"], "visible": true }], "visible": true }, { "element": "Block", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["3"], "visible": true }], "visible": true }]], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["4"], "visible": true }], "visible": true }]], "visible": true }), 'Block', 'Block of code is being executed in a forced scope.'),
        new Helper('break', new E.Break(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, [{ "element": "If", "params": [{ "element": "Equal", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["3"], "visible": true }], "visible": true }, [{ "element": "Break", "params": [], "visible": true }]], "visible": true }]], "visible": true }]], "visible": true }), 'Break', 'Breaks the execution of the current loop.'),
        new Helper('continue', new E.Continue(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, [{ "element": "If", "params": [{ "element": "Equal", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["3"], "visible": true }], "visible": true }, [{ "element": "Continue", "params": [], "visible": true }]], "visible": true }]], "visible": true }]], "visible": true }), 'Continue', 'Skips to the next iteration of the current loop.'),
    ];
    var mathHelpers = [
        new Helper('+', new E.Add(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Add', 'Adds two values without changeing them.'),
        new Helper('-', new E.Substract(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "Substract", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Substract', 'Substracts two values without changeing them.'),
        new Helper('*', new E.Multiply(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "Multiply", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Multiply', 'Multiplies two values without changeing them.'),
        new Helper('/', new E.Divide(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "Divide", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Divide', 'Divides two values without changeing them.'),
        new Helper('==', new E.Equal(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "Equal", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }), 'Equal', 'Checks if two values are equal.'),
        new Helper('!=', new E.NotEqual(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "NotEqual", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }), 'Not equal', 'Checks if two values are not equal.'),
        new Helper('<', new E.Less(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }), 'Less', 'Returns true if second value is greater.'),
        new Helper('<=', new E.LessEqual(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "LessEqual", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }), 'Less or equal', 'Returns true if second value is greater, or both values ear equal.'),
        new Helper('>', new E.More(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "More", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }), 'More', 'Returns true if first value is greater.'),
        new Helper('>=', new E.MoreEqual(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "MoreEqual", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }), 'More or equal', 'Returns true if first value is greater, or both values ear equal.'),
        new Helper('%', new E.Modulo(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["15"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "Modulo", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Modulo', 'Returns the remainder of division of two numbers'),
        new Helper('++', new E.Increment(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }), 'Increment', 'Increments given variable by 1'),
        new Helper('--', new E.Decrement(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "More", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Decrement", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }), 'Decrement', 'Decrements given variable by 1'),
        new Helper('++', new E.PostIncrement(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "PostIncrement", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }), 'Post increment', 'Increments given variable by 1'),
        new Helper('--', new E.PostDecrement(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "More", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "PostDecrement", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }), 'Post decrement', 'Decrements given variable by 1'),
        new Helper('&&', new E.And(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "And", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["0"], "visible": true }, { "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }, [{ "element": "Comment", "params": ["Do something"], "visible": true }]], "visible": true }]], "visible": true }), 'And', 'Returns true, if both values (on the left and on the right) are true.'),
        new Helper('||', new E.Or(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["-6"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "Or", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["100"], "visible": true }, { "element": "RawData", "params": ["i"], "visible": true }], "visible": true }], "visible": true }, [{ "element": "Comment", "params": ["Do something"], "visible": true }]], "visible": true }]], "visible": true }), 'Or', 'Returns true, if any value (on the left or on the right) is true.'),
        new Helper('!', new E.Not(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "Not", "params": [{ "element": "Equal", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["1"], "visible": true }], "visible": true }], "visible": true }, [{ "element": "Comment", "params": ["Do something"], "visible": true }]], "visible": true }]], "visible": true }), 'Not', 'Returns true, if passed value is false, and false if passed value is true.'),
    ];
    var variableHelpers = [
        new Helper('=', new E.Set(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "RawData", "params": ["11"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Set', 'Sets the value of variable on the left to the value on the right.'),
        new Helper('var', new E.VariableDeclaration(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }]], "visible": true }), 'Variable declaration', 'Creates a variable of given name and type on the stack and assigns a default value to it.'),
        new Helper('var', new E.VariableImplicitDefinition(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }]], "visible": true }), 'Variable definition', 'Creates a variable of given name on the stack and assigns provided value to it.'),
        new Helper('var', new E.VariableDefinition(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["a", { "element": "Int", "params": [], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }]], "visible": true }), 'Variable definition', 'Creates a variable of given name and type on the stack and assigns provided value to it.'),
        new Helper('ref', new E.ReferenceDeclaration(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ReferenceDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "NewHeapObject", "params": [{ "element": "Int", "params": [], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }), 'Reference', 'Creates a new reference (that can point at objects of the specific type), places it on the stack and assings null to it.'),
        new Helper('ref', new E.ReferenceDefinition(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ReferenceDefinition", "params": ["a", { "element": "Int", "params": [], "visible": true }, { "element": "NewHeapObject", "params": [{ "element": "Int", "params": [], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }), 'Reference definition', 'Creates a new reference (that can point at objects of the specific type), places it on the stack and assings rovided value to it.'),
        new Helper('alias', new E.AliasDefinition(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }, { "element": "AliasDefinition", "params": ["a", { "element": "Int", "params": [], "visible": true }, { "element": "RawData", "params": ["foo"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["2"], "visible": true }], "visible": true }]], "visible": true }), 'Alias definition', 'Aliasing is like giving the second name to the variable, that already exists in the memory.'),
        new Helper('alias', new E.AliasDeclaration(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["swap", [{ "element": "AliasDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "AliasDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Void", "params": [], "visible": true }, [{ "element": "VariableImplicitDefinition", "params": ["temp", { "element": "RawData", "params": ["a"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["b"], "visible": true }, { "element": "RawData", "params": ["temp"], "visible": true }], "visible": true }]], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["x", { "element": "RawData", "params": ["1"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["y", { "element": "RawData", "params": ["2"], "visible": true }], "visible": true }, { "element": "FunctionCall", "params": [{ "element": "RawData", "params": ["swap"], "visible": true }, [{ "element": "RawData", "params": ["x"], "visible": true }, { "element": "RawData", "params": ["y"], "visible": true }]], "visible": true }]], "visible": true }), 'Alias', 'Aliasing is like giving the second name to the variable, that already exists in the memory.'),
    ];
    var functionHelpers = [
        new Helper('fun', new E.Function(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["add", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Int", "params": [], "visible": true }, [{ "element": "Return", "params": [{ "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["foo", { "element": "FunctionCall", "params": [{ "element": "RawData", "params": ["add"], "visible": true }, [{ "element": "RawData", "params": ["2"], "visible": true }, { "element": "RawData", "params": ["4"], "visible": true }]], "visible": true }], "visible": true }]], "visible": true }), 'Function definition', 'Creates a new function and places it on the stack. Function has a name, which enables us to call it later, parameters list, which indicates arguments to be passed during the call and a type, of which the returned by functon value must be. Parapeters can be variables, references or alaises. After that there is the body of the function. If the sunction is defined inside the class definiton it becomes a method, which has access to the special reference "this"'),
        new Helper('()', new E.FunctionCall(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["add", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Int", "params": [], "visible": true }, [{ "element": "Return", "params": [{ "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["foo", { "element": "FunctionCall", "params": [{ "element": "RawData", "params": ["add"], "visible": true }, [{ "element": "RawData", "params": ["2"], "visible": true }, { "element": "RawData", "params": ["4"], "visible": true }]], "visible": true }], "visible": true }]], "visible": true }), 'Function call', 'Enables us to call previously defined function. Provided arguments must much parameters list.'),
        new Helper('return', new E.Return(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["add", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Int", "params": [], "visible": true }, [{ "element": "Return", "params": [{ "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["foo", { "element": "FunctionCall", "params": [{ "element": "RawData", "params": ["add"], "visible": true }, [{ "element": "RawData", "params": ["2"], "visible": true }, { "element": "RawData", "params": ["4"], "visible": true }]], "visible": true }], "visible": true }]], "visible": true }), 'Return', 'Terminates execution of the current function and returns passed value.'),
    ];
    var typeHelpers = [
        new Helper('number', new E.Int(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["foo", { "element": "Int", "params": [], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }]], "visible": true }), 'Number', 'Standard, numeric type.'),
        new Helper('bool', new E.Bool(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["foo", { "element": "Bool", "params": [], "visible": true }, { "element": "True", "params": [], "visible": true }], "visible": true }]], "visible": true }), 'Bool', 'Boolean (true/false) type.'),
        new Helper('string', new E.String(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["foo", { "element": "String", "params": [], "visible": true }, { "element": "StringLiteral", "params": ["Hello"], "visible": true }], "visible": true }]], "visible": true }), 'String', 'Standard, string type.'),
        new Helper('void', new E.Void(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["addAndPrint", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Void", "params": [], "visible": true }, [{ "element": "Print", "params": [{ "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }), 'Void', 'An empty type.'),
        new Helper('class', new E.BaseClassDefinition(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Class", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }, { "element": "Function", "params": ["setA", [{ "element": "VariableDeclaration", "params": ["x", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Void", "params": [], "visible": true }, [{ "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["this"], "visible": true }, "a"], "visible": true }, { "element": "RawData", "params": ["x"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }, { "element": "VariableDeclaration", "params": ["foo", { "element": "RawData", "params": ["Class"], "visible": true }], "visible": true }, { "element": "FunctionCall", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "setA"], "visible": true }, [{ "element": "RawData", "params": ["15"], "visible": true }]], "visible": true }, { "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "b"], "visible": true }, { "element": "RawData", "params": ["31"], "visible": true }], "visible": true }]], "visible": true }), 'Class definition', 'Creates a class which consists of the given set of fields and methods. You can create objects of this clas, which then you can use as every other values.'),
        new Helper('.', new E.Path(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Class", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }, { "element": "Function", "params": ["setA", [{ "element": "VariableDeclaration", "params": ["x", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Void", "params": [], "visible": true }, [{ "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["this"], "visible": true }, "a"], "visible": true }, { "element": "RawData", "params": ["x"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }, { "element": "VariableDeclaration", "params": ["foo", { "element": "RawData", "params": ["Class"], "visible": true }], "visible": true }, { "element": "FunctionCall", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "setA"], "visible": true }, [{ "element": "RawData", "params": ["15"], "visible": true }]], "visible": true }, { "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "b"], "visible": true }, { "element": "RawData", "params": ["31"], "visible": true }], "visible": true }]], "visible": true }), 'Path', 'Returns an alias to the specific field (or method) of the provided object.'),
        new Helper('ref', new E.Ref(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["newInt", [], { "element": "Ref", "params": [{ "element": "Int", "params": [], "visible": true }], "visible": true }, [{ "element": "Return", "params": [{ "element": "NewHeapObject", "params": [{ "element": "Int", "params": [], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }, { "element": "ReferenceDefinition", "params": ["foo", { "element": "Int", "params": [], "visible": true }, { "element": "FunctionCall", "params": [{ "element": "RawData", "params": ["newInt"], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }), 'Reference', 'The reference type.'),
        new Helper('[]', new E.Array(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDeclaration", "params": ["foo", { "element": "Array", "params": [{ "element": "Int", "params": [], "visible": true }, "4"], "visible": true }], "visible": true }]], "visible": true }), 'Array', 'The array type.'),
        new Helper('type of', new E.TypeOf(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "TypeOf", "params": [{ "element": "RawData", "params": ["a"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Type of', 'Returns the type of the value.'),
    ];
    var otherHelpers = [
        new Helper('print', new E.Print(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Print", "params": [{ "element": "StringLiteral", "params": ["Your name:"], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["name", { "element": "String", "params": [], "visible": true }], "visible": true }, { "element": "Scan", "params": [{ "element": "RawData", "params": ["name"], "visible": true }], "visible": true }, { "element": "Print", "params": [{ "element": "Add", "params": [{ "element": "StringLiteral", "params": ["Your name is "], "visible": true }, { "element": "RawData", "params": ["name"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Print', 'Prints given value to console'),
        new Helper('scan', new E.Scan(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Print", "params": [{ "element": "StringLiteral", "params": ["Your name:"], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["name", { "element": "String", "params": [], "visible": true }], "visible": true }, { "element": "Scan", "params": [{ "element": "RawData", "params": ["name"], "visible": true }], "visible": true }, { "element": "Print", "params": [{ "element": "Add", "params": [{ "element": "StringLiteral", "params": ["Your name is "], "visible": true }, { "element": "RawData", "params": ["name"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }), 'Scan', 'Scans value from input and assings it to the variable'),
        new Helper('//', new E.Comment(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Comment", "params": ["Name of the user"], "visible": true }, { "element": "VariableDeclaration", "params": ["name", { "element": "String", "params": [], "visible": true }], "visible": true }, { "element": "Comment", "params": ["Surname of the user"], "visible": true }, { "element": "VariableDeclaration", "params": ["surname", { "element": "String", "params": [], "visible": true }], "visible": true }, { "element": "Comment", "params": ["Scanning name and surname"], "visible": true }, { "element": "Scan", "params": [{ "element": "RawData", "params": ["name"], "visible": true }], "visible": true }, { "element": "Scan", "params": [{ "element": "RawData", "params": ["surname"], "visible": true }], "visible": true }]], "visible": true }), 'Comment', 'Single line, text comment'),
        new Helper('/**/', new E.MultilineComment(), Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Stack", [{ "element": "VariableImplicitDefinition", "params": ["value", { "element": "RawData", "params": ["0"], "visible": false }], "visible": false }, { "element": "ReferenceDeclaration", "params": ["next", { "element": "RawData", "params": ["Stack"], "visible": false }], "visible": false }]], "visible": false }, { "element": "ReferenceDeclaration", "params": ["top", { "element": "RawData", "params": ["Stack"], "visible": true }], "visible": true }, { "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, [{ "element": "ReferenceDefinition", "params": ["newTop", { "element": "RawData", "params": ["Stack"], "visible": true }, { "element": "NewHeapObject", "params": [{ "element": "RawData", "params": ["Stack"], "visible": true }, []], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["newTop"], "visible": true }, "next"], "visible": true }, { "element": "RawData", "params": ["top"], "visible": true }], "visible": true }, { "element": "MultilineComment", "params": [[{ "element": "Comment", "params": ["This part of code will not execute"], "visible": true }, { "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["newTop"], "visible": true }, "value"], "visible": true }, { "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["top"], "visible": true }, { "element": "RawData", "params": ["newTop"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }]], "visible": true }), 'Comment', 'Multiline line comment'),
    ];
    MenuInflater.allHelpers = [].concat(valueHelpers, flowHelpers, variableHelpers, mathHelpers, typeHelpers, otherHelpers, functionHelpers);
})(MenuInflater || (MenuInflater = {}));
var ProgramsInflater;
(function (ProgramsInflater) {
    class Helper {
        constructor(program, name, description) {
            this.program = program;
            this.name = name;
            this.description = description;
        }
        getProgram() {
            return this.program.getCopy();
        }
    }
    function inflate(container, elements, menu, programManager) {
        elements.forEach((value) => {
            var helper = $('<div></div>');
            helper.addClass('helper');
            var name = $('<div></div>');
            name.text(value.name);
            name.addClass('helperName');
            helper.append(name);
            var description = $('<div></div>');
            description.text(value.description);
            description.addClass('helperDescription');
            helper.append(description);
            var helperButton = $('<div>Load</div>');
            helperButton.addClass('helperButton');
            helper.append(helperButton);
            helperButton.click(() => {
                programManager.setProgram(value.getProgram());
            });
            var programToDisplay = value.getProgram();
            helper.mouseenter(() => {
                programManager.setPreview(programToDisplay);
                programManager.showIDEPart(Program.IDEParts.Preview);
            });
            helper.mouseleave(() => {
                programManager.showIDEPart(Program.IDEParts.Code);
            });
            container.append(helper);
        });
    }
    function inflateWithStructuresHelpers(container, menu, programManager) {
        inflate(container, ProgramsInflater.structuresHelpers, menu, programManager);
    }
    ProgramsInflater.inflateWithStructuresHelpers = inflateWithStructuresHelpers;
    function inflateWithSortHelpers(container, menu, programManager) {
        inflate(container, ProgramsInflater.sortHelpers, menu, programManager);
    }
    ProgramsInflater.inflateWithSortHelpers = inflateWithSortHelpers;
    ProgramsInflater.structuresHelpers = [
        new Helper(Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Stack", [{ "element": "VariableImplicitDefinition", "params": ["value", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "ReferenceDeclaration", "params": ["next", { "element": "RawData", "params": ["Stack"], "visible": true }], "visible": true }]], "visible": true }, { "element": "ReferenceDeclaration", "params": ["top", { "element": "RawData", "params": ["Stack"], "visible": true }], "visible": true }, { "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, [{ "element": "ReferenceDefinition", "params": ["newTop", { "element": "RawData", "params": ["Stack"], "visible": true }, { "element": "NewHeapObject", "params": [{ "element": "RawData", "params": ["Stack"], "visible": true }, []], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["newTop"], "visible": true }, "next"], "visible": true }, { "element": "RawData", "params": ["top"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["newTop"], "visible": true }, "value"], "visible": true }, { "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["top"], "visible": true }, { "element": "RawData", "params": ["newTop"], "visible": true }], "visible": true }]], "visible": true }, { "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["top"], "visible": true }], "visible": true }, { "element": "NotEqual", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "Null", "params": [], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "Path", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, "next"], "visible": true }], "visible": true }, [{ "element": "Print", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, "value"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }), 'Stack', 'Simple stack implementation based on one way linked list'),
    ];
    ProgramsInflater.sortHelpers = [];
})(ProgramsInflater || (ProgramsInflater = {}));
var Menu;
(function (Menu_1) {
    class MenuPage {
        constructor(menu, label, content, backButtonName) {
            this.menu = menu;
            this.label = label;
            this.content = content;
            this.element = GUI.empty().addClass('IDEPartPage');
            var header = GUI.empty().addClass('IDEPartName').appendTo(this.element);
            if (backButtonName) {
                var backButton = GUI.empty().addClass('IDEPartHeaderButton labeledItem').appendTo(header);
                GUI.empty('span').addClass('glyphicon glyphicon-menu-left').attr('aria-hidden', 'true').appendTo(backButton);
                GUI.empty('p').text(backButtonName.toLowerCase()).appendTo(backButton);
                GUI.empty().addClass('label').text('go back').appendTo(backButton);
                backButton.click(() => { menu.goBack(); });
            }
            {
                this.loadingIndicator = GUI.empty().addClass('IDEPartHeaderButton right loadingIndicator').appendTo(header);
                GUI.empty('p').text('loading').appendTo(this.loadingIndicator);
                GUI.empty('span').addClass('glyphicon glyphicon-refresh').attr('aria-hidden', 'true').appendTo(this.loadingIndicator);
                this.loadingIndicator.hide();
            }
            var name = GUI.empty().addClass('IDEPartNameText').text(this.label);
            header.append(name);
            this.content.getElement().addClass('IDEPartContent').appendTo(this.element);
            this.setLoading(false);
        }
        getElement() {
            return this.element;
        }
        updateUI() {
            this.content.updateUI();
        }
        setLoading(isLoading) {
            if (isLoading) {
                this.loadingIndicator.show(500);
            }
            else {
                this.loadingIndicator.hide(500);
            }
        }
    }
    class Menu {
        constructor(holder, programManager) {
            this.holder = holder;
            this.programManager = programManager;
            this._pages = [];
            this._currentNavigationToken = 0;
        }
        getElement() {
            return this.holder;
        }
        updateUI() {
            if (this.hasPages())
                this.topPage().updateUI();
        }
        hasPages() { return this._pages.length > 0; }
        topPage() { return this._pages[this._pages.length - 1]; }
        getNavigationToken() {
            return ++this._currentNavigationToken;
        }
        navigateTo(page, token, instant) {
            if (token != this._currentNavigationToken)
                return;
            if (this.hasPages()) {
                var topPage = this.topPage();
                topPage.setLoading(false);
                topPage.getElement().stop().animate({ opacity: 0, top: '-20px' }, instant ? 0 : Menu.MENU_ANIMATION_DURATION, () => {
                    topPage.getElement().detach();
                });
            }
            page.getElement().stop().delay(instant ? 0 : Menu.MENU_ANIMATION_DURATION / 2).css({ opacity: 0, top: '20px' }).appendTo(this.holder).animate({ opacity: 1, top: '0' }, instant ? 0 : Menu.MENU_ANIMATION_DURATION);
            this._pages.push(page);
            this.topPage().updateUI();
        }
        goBack() {
            this.getNavigationToken();
            if (this._pages.length > 0) {
                var topPage = this._pages.pop();
                topPage.getElement().stop().animate({ opacity: 0, top: '20px' }, Menu.MENU_ANIMATION_DURATION, () => {
                    topPage.getElement().detach();
                });
            }
            var page = this.topPage();
            page.getElement().stop().delay(Menu.MENU_ANIMATION_DURATION / 2).css({ opacity: 0, top: '-20px' }).appendTo(this.holder).animate({ opacity: 1, top: '0' });
            page.updateUI();
            this.topPage().setLoading(false);
        }
        indicateLoading() {
            this.topPage().setLoading(true);
        }
        generateMenuPageContent(content) {
            var menu = new GUI.Scrollable(GUI.empty());
            var mainContent = menu.getContent().addClass('menu');
            content.forEach((e, i) => {
                var button = GUI.empty().addClass('menuButton');
                if (e.extraClass)
                    button.addClass(e.extraClass);
                var labels = GUI.empty().addClass('menuButtonLabels').appendTo(button);
                var titleLabel = GUI.empty('label').text(e.label).appendTo(labels);
                if (e.path)
                    titleLabel.prepend(GUI.empty('span').addClass('menuButtonPath').text(e.path));
                if (e.sublabel)
                    GUI.empty('label').text(e.sublabel).addClass('menuSubLabel').appendTo(labels);
                GUI.empty('span').addClass('glyphicon').addClass(e.icon).attr('aria-hidden', 'true').appendTo(button);
                button.click(e.action);
                mainContent.append(button);
            });
            return menu;
        }
        generateMenuPage(title, content, backButtonName) {
            var menu = this.generateMenuPageContent(content);
            return new MenuPage(this, title, menu, backButtonName);
        }
        gotoMainMenu() {
            if (!this._mainMenu) {
                var content = [
                    { label: 'Toolbox', sublabel: 'Basic components using which you can build programs', icon: 'glyphicon-menu-right', action: () => { this.gotoToolbox(); } },
                    { label: 'Tutorials', sublabel: 'You can find ready to use programs here', icon: 'glyphicon-menu-right', action: () => { this.gotoSections(); } },
                    { label: 'Save/Load program', sublabel: 'Download your work to finish it later', icon: 'glyphicon-menu-right', action: () => { this.gotoSaveLoad(); } }
                ];
                this._mainMenu = this.generateMenuPage('Menu', content);
            }
            this.navigateTo(this._mainMenu, this.getNavigationToken());
        }
        gotoToolbox() {
            if (!this._toolbox) {
                var toolbox = new GUI.Pickable(GUI.empty());
                var tabs = [
                    ['Values', MenuInflater.inflateWithValueHelpers],
                    ['Math', MenuInflater.inflateWithMathHelpers],
                    ['Variables', MenuInflater.inflateWithVariableHelpers],
                    ['Flow', MenuInflater.inflateWithFlowHelpers],
                    ['Types', MenuInflater.inflateWithClassHelpers],
                    ['Functions', MenuInflater.inflateWithFunctionHelpers],
                    ['Other', MenuInflater.inflateWithOtherHelpers],
                    ['All', MenuInflater.inflateWithAllHelpers],
                ];
                $.each(tabs, (i, e) => {
                    var scrollable = new GUI.Scrollable(GUI.empty());
                    var pickable = toolbox.addPickable(e[0], scrollable);
                    var content = scrollable.getContent();
                    content.addClass('elementsField');
                    e[1](content, this);
                });
                toolbox.select(0);
                this._toolbox = new MenuPage(this, 'Toolbox', toolbox, 'Back');
            }
            this.navigateTo(this._toolbox, this.getNavigationToken());
        }
        gotoElementPreviw(helper) {
            var previewHolder = new GUI.Scrollable(GUI.empty());
            var preview = previewHolder.getContent().addClass('elementPreview');
            GUI.empty().addClass('elementPreviewElement').append(helper.element.getCopy().getElement()).appendTo(preview);
            GUI.empty().addClass('elementPreviewText').text(helper.description).appendTo(preview);
            GUI.empty().addClass('elementPreviewExample').append(helper.example.getElement()).appendTo(preview);
            GUI.empty().addClass('elementPreviewHint').text(helper.shortcut).appendTo(preview);
            var page = new MenuPage(this, helper.name, previewHolder, 'Toolbox');
            this.navigateTo(page, this.getNavigationToken());
        }
        goThroughNavigationTreeStep(sections, name, backName, path) {
            if (sections.length) {
                var content = sections.map((value, index) => {
                    var newPath = path + (index + 1).toString() + '.';
                    return {
                        label: value.Name,
                        sublabel: value.Description,
                        icon: 'glyphicon-menu-right',
                        action: value.IsSection ?
                                () => { this.gotoSubsections(value.Id, value.Name, backName, newPath); }
                            :
                                    () => { this.gotoLesson(value.Id, name); },
                        path: newPath
                    };
                });
                var page = this.generateMenuPage(name, content, backName);
                this.navigateTo(page, this.getNavigationToken(), true);
                for (var i = 0; i < sections.length; i++) {
                    if (sections[i].Subsections.length) {
                        var section = sections[i];
                        this.goThroughNavigationTreeStep(sections[i].Subsections, section.Name, name, path + (i + 1).toString() + '.');
                    }
                }
            }
        }
        goThroughNavigationTree(navigationTree, lesson) {
            this.goThroughNavigationTreeStep(navigationTree, 'Tutorial', 'Menu', '');
            this.gotoLessonForLessonData(lesson, 'back', this.getNavigationToken());
        }
        gotoSections() {
            var navigationToken = this.getNavigationToken();
            this.indicateLoading();
            $.getJSON('/api/sections', (data) => {
                var content = data.map((value, index) => {
                    var path = (index + 1).toString() + '.';
                    return {
                        label: value.Name,
                        sublabel: value.Description,
                        icon: 'glyphicon-menu-right',
                        action: () => { this.gotoSubsections(value.Id, value.Name, 'Tutorial', path); },
                        path: path
                    };
                });
                var sections = this.generateMenuPage('Tutorial', content, 'Menu');
                this.navigateTo(sections, navigationToken);
            });
        }
        gotoSubsections(id, name, backName, path) {
            var navigationToken = this.getNavigationToken();
            this.indicateLoading();
            $.getJSON('/api/sections/' + id, (data) => {
                var content = [].concat(data.sections.map((value, index) => {
                    var newPath = path + (index + 1).toString() + '.';
                    return {
                        label: value.Name,
                        sublabel: value.Description,
                        icon: 'glyphicon-menu-right',
                        action: () => { this.gotoSubsections(value.Id, value.Name, name, newPath); },
                        path: newPath
                    };
                })).concat(data.lessons.map((value, index) => {
                    var newPath = path + (index + 1).toString() + '.';
                    return {
                        label: value.Name,
                        sublabel: value.Description,
                        icon: 'glyphicon-menu-right',
                        action: () => { this.gotoLesson(value.Id, name); },
                        path: newPath
                    };
                }));
                var sections = this.generateMenuPage(name, content, backName);
                this.navigateTo(sections, navigationToken);
            });
        }
        gotoLessonForLessonData(data, section, navigationToken) {
            var pickable = new GUI.Pickable(GUI.empty());
            var program = Serializer.deserialize(JSON.parse(data.Code));
            var content = [{
                    label: 'Load code',
                    sublabel: 'Load code of this example into "Your code" section',
                    icon: 'glyphicon-pencil',
                    action: () => {
                        this.programManager.stop();
                        this.programManager.setProgram(program.getCopy());
                    }
                }, {
                    label: 'Open toolbox',
                    sublabel: 'Navigate to the toolbox',
                    icon: 'glyphicon-menu-right',
                    action: () => { this.gotoToolbox(); }
                }];
            var subMenu = this.generateMenuPageContent(content);
            var task = $("<div>" + data.Task + "</div>").addClass('taskDescription');
            task.find('script').remove();
            task.find('img').remove();
            subMenu.getContent().append(task);
            var preview = new GUI.Scrollable(GUI.empty());
            GUI.empty().addClass('elementPreviewExample')
                .append(program.getCopy().getElement())
                .appendTo(preview.getContent().addClass('elementPreview'));
            pickable.addPickable('Preview', preview);
            pickable.addPickable('About', subMenu);
            pickable.select(1);
            var menuPage = new MenuPage(this, data.Name, pickable, section);
            this.navigateTo(menuPage, navigationToken);
            var url = "/ide/" + data.Id + "/" + data.Name;
            url = url.replace(/\s+/g, '-').toLowerCase();
            window.history.replaceState({}, "data.Name", url);
            if (window.ga) {
                window.ga('send', 'pageview', url);
            }
        }
        gotoLesson(id, section) {
            var navigationToken = this.getNavigationToken();
            this.indicateLoading();
            $.getJSON('/api/lessons/' + id, (data) => {
                this.gotoLessonForLessonData(data, section, navigationToken);
            });
        }
        gotoSaveLoad() {
            if (!this._saveLoad) {
                var uploadForm = MemoryManager.createUploadForm(this.programManager).addClass('uploadForm');
                var content = [
                    { label: 'Save', sublabel: 'Download you program', icon: 'glyphicon-floppy-disk', action: () => { MemoryManager.downloadProgram(this.programManager); } },
                    { label: 'Open', sublabel: 'Upload previously downloaded program', icon: 'glyphicon-folder-open', action: () => { uploadForm.click(); }, extraClass: 'uploadButton' }
                ];
                this._saveLoad = this.generateMenuPage('Save/Load', content, 'Menu');
                var uploadButton = this._saveLoad.getElement().find('.uploadButton');
                uploadButton.before(uploadForm);
            }
            this.navigateTo(this._saveLoad, this.getNavigationToken());
        }
    }
    Menu.MENU_ANIMATION_DURATION = 300;
    Menu_1.Menu = Menu;
    function getMainMenu() {
        throw 'not implemented exception';
    }
    Menu_1.getMainMenu = getMainMenu;
})(Menu || (Menu = {}));
$(() => {
    var code = $('.codeElement');
    var body = $('body');
    var codeField = new GUI.Scrollable($('#codeField').find('.IDEPartContent'));
    codeField.getContent().addClass('codeField');
    var previewField = new GUI.Scrollable($('#previewCodeField').find('.IDEPartContent'));
    previewField.getContent().addClass('codeField');
    var stack = new GUI.Scrollable($('#stack'));
    stack.getContent().addClass('stack');
    var heap = new GUI.Scrollable($('#heap'));
    heap.getContent().addClass('heap');
    var tempStack = new GUI.Scrollable($('#tempStack'));
    tempStack.getContent().addClass('tempStack');
    var descriptionField = $('#descriptionIDEPart').find('.IDEPartContent');
    var trash = $('#trash');
    MemoryObservers.getEnvironmentObserver();
    var programManager = new Program.ProgramManager(codeField.getContent(), stack.getContent(), tempStack.getContent(), heap.getContent(), previewField.getContent(), descriptionField);
    var menu = new Menu.Menu($('#IDEPartMenu'), programManager);
    menu.gotoMainMenu();
    GUI.getExecutionIndicator().getElement().insertBefore(codeField.getContent());
    codeField.onScroll = () => { GUI.getExecutionIndicator().updateUI(); };
    stack.onScroll = tempStack.onScroll = heap.onScroll = () => { programManager.updateMemoryUI(); };
    GUI.setAsTrash(trash);
    GUI.makeResizable($('#IDEPartMenu'), true);
    GUI.makeResizable($('#IDEPartProgram'), true);
    GUI.makeResizable($('#memoryPartTempStakc'), true);
    GUI.makeResizable($('#memoryPartStack'), true);
    GUI.makeResizable($('#IDE'), false);
    programManager.setProgram(Serializer.deserialize(JSON.parse(window.lesson.Code)));
    if (window.navigationTree) {
        menu.goThroughNavigationTree(window.navigationTree, window.lesson);
    }
    var running = false;
    var stepDuration = 500;
    var showTempStack = false;
    var autorun = false;
    var runButton = $('#run_button');
    var stepButton = $('#step_button');
    var pauseButton = $('#pause_button');
    var clearButton = $('#clear_button');
    var clearProgramButton = $('#clear_programm_button');
    GUI.disableMenuButton($('#clear_button'));
    GUI.disableMenuButton($('#pause_button'));
    programManager.onStart.push(() => {
        running = true;
        programManager.disableCodeEdition();
        GUI.enableMenuButton(pauseButton);
        GUI.enableMenuButton(clearButton);
        GUI.disableMenuButton(clearProgramButton);
    });
    programManager.onDone.push(() => {
        running = false;
        autorun = false;
        programManager.enableCodeEdition();
        GUI.enableMenuButton(runButton);
        GUI.enableMenuButton(stepButton);
        GUI.enableMenuButton(clearProgramButton);
        GUI.disableMenuButton(clearButton);
        GUI.disableMenuButton(pauseButton);
    });
    clearButton.click(function () {
        autorun = false;
        programManager.stop();
    });
    clearProgramButton.click(() => programManager.setProgram(new E.Program()));
    var stepFunction = () => {
        var operation = programManager.step();
        while (operation != L.OperationType.Done &&
            !showTempStack &&
            operation == L.OperationType.TempMemoryOperation)
            operation = programManager.step();
        return operation;
    };
    runButton.click(function () {
        if (!autorun) {
            autorun = true;
            var refreshfunction = () => {
                if (autorun && stepFunction() != L.OperationType.Done)
                    setTimeout(refreshfunction, stepDuration);
                else
                    autorun = false;
            };
            refreshfunction();
            GUI.enableMenuButton(pauseButton);
        }
    });
    stepButton.click(function () {
        autorun = false;
        stepFunction();
        GUI.enableMenuButton(runButton);
        GUI.disableMenuButton(pauseButton);
    });
    pauseButton.click(function () {
        autorun = false;
        GUI.enableMenuButton(runButton);
        GUI.disableMenuButton(pauseButton);
    });
    var speedSlider = new GUI.Slider(0, 100, 70, (newValue) => {
        newValue = 101 - newValue;
        newValue = newValue * newValue / 2;
        newValue = Math.round(newValue);
        GUI.getConsole().printInternalMessage('Program step duration changed to ' + newValue + ' ms');
        stepDuration = newValue;
    });
    $('#speedSliderPlaceholder').replaceWith(speedSlider.getElement().addClass('speedSlider'));
    var tempStackCheckBox = new GUI.CheckBox(showTempStack, (value) => {
        showTempStack = value;
        if (value)
            $('#memoryPartTempStakc').removeClass('memoryPartHidden');
        else
            $('#memoryPartTempStakc').addClass('memoryPartHidden');
    });
    $('#tempStackCheckBox').replaceWith(tempStackCheckBox.getElement().addClass('tempStackCheckBox'));
    var help = new GUI.Help($('#help'));
    var helpToolbox = $('<div></div>').addClass('helpToolbox');
    helpToolbox.append($('<h3></h3>').text('Toolbox section'));
    helpToolbox.append($('<div></div>').text('You can use these elements to build your code. Just pick one, drag it and drop it inside "Your code" sectoin in an appropriate place. You can use single part multiple times. Rememder that to find out what selected elemnt does, you simply have to read description or try it out.'));
    helpToolbox.append($('<h3></h3>').text('Basic components of element:'));
    helpToolbox.append($('<div></div>').text('Not editable label:'));
    helpToolbox.append((new JustToShowElements.Label()).getElement());
    helpToolbox.append($('<br/>'));
    helpToolbox.append($('<div></div>').text('Place where you can type in some text, but inside which you can not drop any other element:'));
    helpToolbox.append((new JustToShowElements.Name()).getElement());
    helpToolbox.append($('<br/>'));
    helpToolbox.append($('<div></div>').text('Place inside which you can drop one other element:'));
    helpToolbox.append((new JustToShowElements.DropField()).getElement());
    helpToolbox.append($('<br/>'));
    helpToolbox.append($('<div></div>').text('Place inside which you can drop multiple elements in any order:'));
    helpToolbox.append((new JustToShowElements.DropList()).getElement());
    helpToolbox.append($('<br/>'));
    helpToolbox.append($('<div></div>').text('Instead of dropping new elemnts, you can simply type your code inside those two last types of components.'));
    help.addDescription($('#IDEPartMenu'), helpToolbox);
    var helpYourCode = $('<div></div>');
    helpYourCode.append($('<h3></h3>').text('Your code section'));
    helpYourCode.append($('<div></div>').text('You can find here your entire program. To build it you can drag and drop elements from toolbox section, or type the code yourself.'));
    help.addDescription($('#IDEPartProgram'), helpYourCode);
    var helpMemory = $('<div></div>');
    helpMemory.append($('<h3></h3>').text('Momory section'));
    helpMemory.append($('<div></div>').text('It is a part, where you can observe in real time how the memory is changing during program execution. On the left side you can see a stack, and on the right side a heap. All ralations between memory fields and all scopes are being displayed too.'));
    help.addDescription($('#IDEPartMemory'), helpMemory);
    var helpMemory = $('<div></div>');
    helpMemory.append($('<div></div>').text('Top bar is a place from which you can control execution of your program.'));
    help.addDescription($('#topBar'), helpMemory);
    var helpConsole = $('<div></div>');
    helpConsole.append($('<div></div>').text('In console you can find all messages printed by your program during execution. It is also a source of input for your program.'));
    help.addDescription($('#console'), helpConsole);
    GUI.getConsole().clear();
    GUI.getConsole().printInternalMessage('This is still an early version of this application. Some things might not work correcty, others might not work at all.');
    $(() => {
        codeField.updateUI();
        previewField.updateUI();
        stack.updateUI();
        heap.updateUI();
        tempStack.updateUI();
        menu.updateUI();
        GUI.getConsole().updateUI();
    });
});
