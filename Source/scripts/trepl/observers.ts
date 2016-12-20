module TypeSystemObserver {

    export class VoidObjectObserver implements ObjectObserver {
        constructor(private object: TS.VoidObject) { }
        private element: JQuery;
        getElement(): JQuery {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectElement');
            }
            return this.element;
        }
        updateUI() {
        }
    }
    export class BaseClassObjectObserver implements ObjectObserver {
        constructor(private object: TS.BaseClassObject) { }
        private element: JQuery;
        private value: JQuery;
        getElement(): JQuery {
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
    export class FunctionObserver implements ObjectObserver {
        constructor(private fun: TS.FunctionObject) { }
        private element: JQuery;
        private value: JQuery;
        getElement(): JQuery {
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
    export class ClassFieldObserver implements MemoryObservers.MemoryFieldObserver {
        constructor(public field: TS.ClassObjectField) { }
        private element: JQuery;
        private elementName: JQuery;
        //private elementEqual: JQuery;
        private elementValue: JQuery;
        getElement(): JQuery {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectField');
                this.elementName = $('<div></div>');
                this.elementName.addClass('objectFieldName');
                //this.elementEqual = $('<div>=</div>');
                //this.elementEqual.addClass('objectFieldEqual');
                this.elementValue = $('<div></div>');
                this.elementValue.addClass('objectFieldValue');

                this.elementName.append(this.field.name);

                this.element.append(this.elementName);
                //this.element.append(this.elementEqual);
                this.element.append(this.elementValue);
            }
            return this.element;
        }
        setFieldValue(value: TS.Obj) {
            this.getElement();
            this.elementValue.empty();
            this.elementValue.append(value.observer.getElement());
            value.observer.updateUI();
        }
        updateUI() {
            DS.Stack.forAll(
                this.field.getReferences(),
                (value: TS.Reference) => {
                    value.observer.updateUI();
                });

            this.field.getValue().observer.updateUI();
        }
    }
    export class ClassObjectObserver implements ObjectObserver {
        constructor(private object: TS.ClassObject) { }
        private element: JQuery;
        getElement(): JQuery {
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
            for (var key in this.object.fields)
            {
                this.object.fields[key].observer.updateUI();
            }
        }
    }
    export class ArrayFieldObserver implements MemoryObservers.MemoryFieldObserver {
        constructor(public field: TS.ArrayField) { }
        private element: JQuery;
        private elementIndex: JQuery;
        //private elementEqual: JQuery;
        private elementValue: JQuery;
        getElement(): JQuery {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('objectField');
                this.elementIndex = $('<div></div>');
                this.elementIndex.addClass('objectFieldName');
                //this.elementEqual = $('<div>:</div>');
                //this.elementEqual.addClass('objectFieldEqual');
                this.elementValue = $('<div></div>');
                this.elementValue.addClass('objectFieldValue');

                this.elementIndex.append(this.field.index.toString());

                this.element.append(this.elementIndex);
                //this.element.append($('<div></div>').append(this.elementEqual));
                this.element.append(this.elementValue);
            }
            return this.element;
        }
        setFieldValue(value: TS.Obj) {
            this.getElement();
            this.elementValue.empty();
            this.elementValue.append(value.observer.getElement());
        }
        updateUI() {
            DS.Stack.forAll(
                this.field.getReferences(),
                (value: TS.Reference) => {
                    value.observer.updateUI();
                });

            this.field.getValue().observer.updateUI();
        }
    }
    export class ArrayObjectObserver implements ObjectObserver {
        constructor(private object: TS.ArrayObject) { }
        private element: JQuery;
        getElement(): JQuery {
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
    export class ReferenceObserver implements ObjectObserver {
        constructor(private reference: TS.Reference) {
        }
        private element: JQuery;
        private value: JQuery;

        private svg: JQuery;
        private svgCircleA: JQuery;
        private svgCircleB: JQuery;
        private svgLineA: JQuery;
        private svgLineB: JQuery;
        private svgArrow1A: JQuery;
        private svgArrow2A: JQuery;
        private svgArrow1B: JQuery;
        private svgArrow2B: JQuery;

        protected strokeColor = '#5a2569';
        protected fillColor = '#9e61b0';

        getElement(): JQuery {
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
                }

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
                var arrow2 = 'M20,0 L20,5'
                this.svgArrow1A.attr('d', arrow1);
                this.svgArrow1B.attr('d', arrow1);
                this.svgArrow2A.attr('d', arrow2);
                this.svgArrow2B.attr('d', arrow2);
            }
        }
    }
    export class AliasObserver extends ReferenceObserver {
        protected strokeColor = '#2f652b';
        protected fillColor = '#467d42';
    }
    export class PrototypeObserver implements ObjectObserver {
        constructor(private typ: TS.Prototype) { }
        private element: JQuery;
        private value: JQuery;
        getElement(): JQuery {
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
}

module MemoryObservers {
    class StackFieldLabel {
        public element: JQuery = $('<div></div>').addClass('stackField');
        constructor(private index: number) {
            this.setText(index);
        }

        private setText(index: number) {
            this.element.empty();
            var hex = index.toString(16);
            this.element.text('0x' + '00000'.slice(hex.length) + hex);
        }
    }

    var _environmentObserver: EnvironmentObserver = null;
    export function getEnvironmentObserver(): EnvironmentObserver {
        if (!_environmentObserver)
            _environmentObserver = new EnvironmentObserver(); 
        return _environmentObserver;
    }
    class EnvironmentObserver {
        private tempStack: JQuery;
        private stack: JQuery;
        private heap: JQuery;

        private stackValues: JQuery = $('<div></div>').addClass('stackValuesHolder');
        private tempStackValues: JQuery = $('<div></div>').addClass('stackValuesHolder');

        private stackLabels: JQuery = $('<div></div>').addClass('stackLabels');
        private tempStackLabels: JQuery = $('<div></div>').addClass('stackLabels');

        private stackLabelsInner: JQuery = $('<div></div>').addClass('stackLabelsInner');
        private tempStackLabelsInner: JQuery = $('<div></div>').addClass('stackLabelsInner');

        constructor() {
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

        private stackFieldsNumber = 0;
        private addStackLabel() {
            var newStackField = new StackFieldLabel(this.stackFieldsNumber);
            this.stackLabelsInner.append(newStackField.element);
            this.stackFieldsNumber++;
        }

        private tempStackFieldsNumber = 0;
        private addTempStackLabel() {
            var newStackField = new StackFieldLabel(this.tempStackFieldsNumber);
            this.tempStackLabelsInner.append(newStackField.element);
            this.tempStackFieldsNumber++;
        }

        // Manages the offset of the backgrouns, so fields addresses do not overlap with values.
        private updateLabelsOffest() {
            var valuesHeight = this.stackValues.innerHeight();
            this.stackLabels.css('margin-top', valuesHeight);
            this.stackLabelsInner.css('margin-top', -valuesHeight);
        }
        private updateTempLabelsOffest() {
            var valuesHeight = this.tempStackValues.innerHeight();
            this.tempStackLabels.css('margin-top', valuesHeight);
            this.tempStackLabelsInner.css('margin-top', -valuesHeight);
        }

        addFieldToStack(field: Memory.StackField) {
            this.stackValues.append(field.observer.getElement());
            field.observer.updateUI();
            this.updateLabelsOffest();
        }
        removeFieldFromStack(field: Memory.StackField) {
            field.observer.getElement().detach();
            this.updateLabelsOffest();
        }
        addScopeToStack(scope: Memory.StackScope) {
            this.stackValues.append(scope.observer.getElement());
            scope.observer.updateUI();
            this.updateLabelsOffest();
        }
        removeScopeFromStack(scope: Memory.StackScope) {
            scope.observer.getElement().detach();
            this.updateLabelsOffest();
        }
        addFieldToHeap(field: Memory.HeapField) {
            var element = field.observer.getElement();
            element.css('left', this.heap.width()/4);
            var relativeElement = this.heap.children().last();
            if (relativeElement.length)
                element.css('top', parseInt(relativeElement.css('top')) + relativeElement.height() + 20);
            else
                element.css('top', 10);
            this.heap.append(field.observer.getElement());
            field.observer.updateUI();
        }
        addFieldToTempStack(field: Memory.TempStackField) {
            this.tempStackValues.append(field.observer.getElement());
            field.observer.updateUI();
            this.updateTempLabelsOffest();
        }
        removeFieldFromTempStack(field: Memory.TempStackField) {
            field.observer.getElement().detach();
            this.updateTempLabelsOffest();
        }
    }
    export class ScopeObserver {
        constructor(private scope: Memory.StackScope) {
        }
        private element: JQuery;
        private elementName: JQuery;

        getElement(): JQuery {
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

        // Called when the variable gets covered/uncovered
        visible(isVisible: boolean) {
            if (isVisible)
                this.element.removeClass('onStackElementHidden');
            else
                this.element.addClass('onStackElementHidden');
        }
    }
    export class StackFieldObserver implements MemoryFieldObserver {
        constructor(private field: Memory.StackField) {
        }
        private element: JQuery;
        private elementName: JQuery;
        private elementValue: JQuery;
        getElement(): JQuery {
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

        setFieldValue(value: TS.Obj) {
            this.getElement();
            this.elementValue.empty();
            this.elementValue.append(value.observer.getElement());
            value.observer.updateUI();
        }
        updateUI() {
            DS.Stack.forAll(
                this.field.getReferences(),
                (value: TS.Reference) => {
                    value.observer.updateUI();
                });

            this.field.getValue().observer.updateUI();
        }

        // Called when the variable gets covered/uncovered
        visible(isVisible: boolean) {
            if (isVisible)
                this.element.removeClass('onStackElementHidden');
            else
                this.element.addClass('onStackElementHidden');
        }
    }
    export class TempStackFieldObserver implements MemoryFieldObserver {
        constructor(private field: Memory.TempStackField) {
        }
        private element: JQuery;
        private elementValue: JQuery;
        getElement(): JQuery {
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

        setFieldValue(value: TS.Obj) {
            this.getElement();
            this.elementValue.empty();
            this.elementValue.append(value.observer.getElement());
            value.observer.updateUI();
        }
        updateUI() {
            DS.Stack.forAll(
                this.field.getReferences(),
                (value: TS.Reference) => {
                    value.observer.updateUI();
                });

            this.field.getValue().observer.updateUI();
        }
    }
    export class HeapFieldObserver implements MemoryFieldObserver {
        constructor(private field: Memory.HeapField) {
        }
        private element: JQuery;
        private elementValue: JQuery;
        getElement(): JQuery {
            if (!this.element) {
                this.element = $('<div></div>');
                this.element.addClass('onHeapElement');
                this.elementValue = $('<div></div>');
                this.elementValue.addClass('onHeapElementValue');
                this.element.append(this.elementValue);

                this.element.draggable(<any>{
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

        setFieldValue(value: TS.Obj) {
            this.getElement();
            this.elementValue.empty();
            this.elementValue.append(value.observer.getElement());
            value.observer.updateUI();
        }

        private UIUpdated = true;
        updateUI() {
            this.UIUpdated = false;
            DS.Stack.forAll(
                this.field.getReferences(),
                (value: TS.Reference) => {
                    value.observer.updateUI();
                });

            this.element.css('left', Math.min(parseInt(this.element.css('left')), this.element.parent().width() - this.element.outerWidth()));
            this.element.css('left', Math.max(parseInt(this.element.css('left')), 0));

            this.field.getValue().observer.updateUI();
            this.UIUpdated = true;
        }
    }
} 