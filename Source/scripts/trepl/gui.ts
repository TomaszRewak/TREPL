

module GUI {
    /////////////////////// Elements ///////////////////////
    export interface GUIElement {
        getElement(): JQuery;
        updateUI();
    }

    export interface GUIElementWithContent extends GUIElement {
        getContent(): JQuery;
    }

    export function empty(element = 'div'): JQuery {
        return $('<' + element + '></' + element + '>');
    }

    // Helper function to remove placeholders
    export function showPlaceholder(dropFields: JQuery, size: number) {
        dropFields.css('min-height', size);
        if (size == 19)
            dropFields.addClass('hoveredPlaceholder');
        else
            dropFields.removeClass('hoveredPlaceholder');
    }
    export function hideAllPlaceholders() {
        $('.dropListPlaceholder, .dropField').css('min-height', 0).css('height', '').css('width', '').removeClass('hoveredPlaceholder');
    }

    export interface Replecable {
        replaceWith(element: E.Element);
    }

    export function focusOn(element: JQuery) {
		element.addClass('underEdition');
        element.focus();
        document.execCommand('selectAll', false, null);
    }
    export function makeEditable(
        element: JQuery,
        removable: E.Element, // element to be removed when delete button pressed
        keydown: (e: JQueryKeyEventObject) => void = () => { },
        keyup: (e: JQueryKeyEventObject) => boolean = () => { return true },
        edited: () => any = () => { }) {

        element.attr('contenteditable', 'true');
        element.attr('spellcheck', 'false');
        element.addClass('contenteditable');

        element.click((e) => {
            if (!isEditable(element))
                return true;

            var event = <any> e.originalEvent;
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

            var event = <any> e.originalEvent;
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

            var event = <any> e.originalEvent;
            if (event.editableHandled)
                return true;
            event.editableHandled = true;

            if (!element.hasClass('underEdition'))
                return;

            if (!keyup(e))
                return;

            if (e.which == 13 || e.which == 9 || e.which == 38 || e.which == 40) {
                var inputs = $("#codeField [contenteditable='true']");

                var index: number;

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

    export interface IDisplayable {
        getElement(): JQuery;
    }
    export class ElementHelper implements IDisplayable {
        private element: JQuery;
        private holder: JQuery;
        constructor(private helper: E.Element) {
            this.element = $('<div></div>').addClass('elementHelper');
            this.holder = $('<div></div>').addClass('helperHolder');
            this.element.append(this.holder);
            this.holder.append(helper.getElement());
        }
        getElement(): JQuery {
            return this.element;
        }
        getHelper(): E.Element {
            return this.helper;
        }
    }
    export class StringHelper implements IDisplayable {
        private element: JQuery;
        private nameElement: JQuery;
        private descriptionElement: JQuery;
        constructor(public name: string, public description: string) {
            this.element = $('<div></div>').addClass('stringHelper');
            this.nameElement = $('<div></div>').addClass('stringHelperName');
            this.descriptionElement = $('<div></div>').addClass('stringHelperDescription');

            this.element.append(this.nameElement);
            this.element.append(this.descriptionElement);

            this.nameElement.text(name);
            this.descriptionElement.text(description);
        }
        getElement(): JQuery {
            return this.element;
        }
    }
    class EditableHelpersList {
        private element: JQuery = $('<div></div>').addClass('elementHelpersList');
        private currentHelpers: IDisplayable[] = [];
        private currnet: number = 0;

        constructor() {
            $('body').append(this.element);

            window.setInterval(() => {
                this.updateOffset(true);
            }, 1000);
        }

        getElement(): JQuery {
            return this.element;
        }
        clear() {
            this.element.empty();
        }

        fill(currentHelpers: IDisplayable[]) {
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
        getCurrent(): IDisplayable {
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
        private setCurrentIndex(index: number) {
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

        private hovered: JQuery = null;
        hide() {
            this.hovered = null;
            this.element.hide();
        }
        focusOn(hovered: JQuery) {
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

    var _editableHelpersList: EditableHelpersList;
    function getEditableHelpersList(): EditableHelpersList {
        if (!_editableHelpersList)
            _editableHelpersList = new EditableHelpersList();

        return _editableHelpersList;
    }

    export interface IEditableHelpresSource {
        getHelpers(text: string): IDisplayable[];
        helperSelected(helper: IDisplayable);
    }
    export function makeEditableWithHelpers(
        editable: JQuery,
        removable: E.Element,
        source: IEditableHelpresSource,
        keydown: (e: JQueryKeyEventObject) => void = () => { },
        keyup: (e: JQueryKeyEventObject) => boolean = () => { return true },
        edited: () => any = () => { }) {
        
        var textChanged = false;
        makeEditable(
            editable,
            removable,
            (e) => {
                keydown(e);
            },
            (e) => {
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
            },
            () => {
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
            }
            );
    }
    export function setEditable(element: JQuery, editable: boolean = true) {
        if (editable)
            element.attr('contenteditable', 'true');
        else {
            element.removeAttr('contenteditable');
            element.removeClass('underEdition');
        }
    }
    export function isEditable(element: JQuery) {
        return element.attr('contenteditable') == 'true';
    }

    // Adds events like dropping to the element (should be called only if element is in "code" filed)
    export function addDynamicEvants(elem: JQuery) {
    }

    // Adds static events to the object that are required for "code" and "helpers" sections as well
    export function addStaticEvents(elem: JQuery) {

        elem.find('.codeElement').addBack('.codeElement').draggable(<any>{
            stack: '.codeElement', 
            helper: function() {
                return $(this).clone().css("pointer-events", "none").appendTo("body").show();
            },
            opacity: 0.5,
            start: function (event, ui) {
                $(this).css('pointer-events', 'none');
                $(this).css('opacity', '0.5');
                //$('body').css('cursor', 'url(images/elementPointer.png), auto');
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


        //    .on('click', function () {
        //    var element: JQuery = this;
        //    element.focus();
        //});
    }

    export function getRawData(elem: JQuery): string {
        return elem.text();
    }
    
    /////////////////////// Element ///////////////////////
    export function extractElement(element: JQuery): E.Element {
        return element.data(Commons.data_ElementObject);
    }

    /////////////////////// Memory ///////////////////////
    export interface MomoryElement {
        addValue(value: JQuery);
        element: JQuery;
    }
    export class StackElement implements MomoryElement {
        element: JQuery;
        elementName: JQuery;
        elementEqual: JQuery;
        elementValue: JQuery;
        constructor(private name: string) {
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

        addValue(value: JQuery) {
            this.elementValue.empty();
            this.elementValue.append(value);
        }
    }
    export class HeapElement implements MomoryElement {
        element: JQuery;
        elementName: JQuery;
        elementEqual: JQuery;
        elementValue: JQuery;
        constructor() {
            this.element = $('<div></div>');
            this.element.addClass('onHeapElement');
            this.elementValue = $('<div></div>');
            this.elementValue.addClass('onHeapElementValue');

            this.element.append(this.elementValue);
        }

        addValue(value: JQuery) {
            this.elementValue.empty();
            this.elementValue.append(value);
        }
    }

    export function getObjectElementForSimpleType(value: any): JQuery {
        var element = $('<div></div>');
        element.addClass('objectElement');
        element.append(value);
        return element;
    }

    export function getObjectElementForFunction(): JQuery {
        var element = $('<div></div>');
        element.addClass('objectElement');
        element.text('<fun>');
        return element;
    }

    export function getObjectElementForType(): JQuery {
        var element = $('<div></div>');
        element.addClass('objectElement');
        element.text('<type>');
        return element;
    }

    export function getObjectElementForReference(reference: JQuery): JQuery {
        var element = $('<div></div>');
        element.addClass('objectElement');
        var canvas = $('<canvas></canvas>');
        canvas.addClass('connection');
        element.append(canvas);
        element.append('o');

        //element.onPo

        var context = (<any> canvas.get(0)).getContext('2d');
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

    /////////////////////// References ///////////////////////////

    export function linkObjects(canvas: JQuery, first: JQuery, second: JQuery) {
    }

    /////////////////////// User interface ///////////////////////

    export class Scrollable implements GUIElementWithContent {
        private internalHolder: JQuery;
        private contentWrapper: JQuery;
        private scrollBar: JQuery;
        private scrollButton: JQuery;
        onScroll: ()=>void;

        private topOffset = 0;

        constructor(private externalHolder: JQuery) {

            var children = externalHolder.children().detach();

            externalHolder.addClass('scrollExternalHolder');

            this.internalHolder = $('<div></div>').addClass('scrollInternalHolder').appendTo(this.externalHolder);
            this.contentWrapper = $('<div></div>').addClass('scrollContentWrapper').append(children).appendTo(this.internalHolder);
            this.scrollBar = $('<div></div>').addClass('scrollBar').appendTo(this.externalHolder);
            this.scrollButton = $('<div></div>').addClass('scrollBarButton').appendTo(this.scrollBar);
            
            this.scrollButton.draggable(<any>{
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

            externalHolder.bind('mousewheel DOMMouseScroll',(e) => {
                var offset = parseInt(this.contentWrapper.css('margin-top'));
                var orginalEvent = <any> e.originalEvent;
                var delta = parseInt(orginalEvent.wheelDelta || -orginalEvent.detail);

                this.topOffset += delta > 0 ? -60 : 60;
                this.updateUI();
            });

            //this.contentWrapper.on('DOMSubtreeModified', () => {
            //    this.updateUI();
            //});
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

        getContent(): JQuery {
            return this.contentWrapper;
        }

        getElement(): JQuery {
            return this.externalHolder;
        }
    }

    class PickableButton {
        private selected = true;
        constructor(
            public button: JQuery,
            public indicator: JQuery,
            public relatedElement: GUIElement) {
        }
    }
    export class Pickable implements GUIElement {
        private buttonsPerRow : number = 4;

        private options: PickableButton[] = [];
        private buttonsHolders: JQuery[] = [];
        private selectionIndicator: JQuery;
        private pickerHolder: JQuery;
        private pickerContent: JQuery;

        private selectedIndex = -1;

        constructor(private externalHolder: JQuery) {
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

        getElement(): JQuery {
            return this.externalHolder;
        }
        updateUI() {
            if (this.selectedIndex != -1)
                this.options[this.selectedIndex].relatedElement.updateUI();
        }

        addPickable(name: string, element: GUIElement) {
            var buttonsHolder: JQuery;

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

        select(index: number) {
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

    export function makeResizable(toResize: JQuery, horizontal: boolean, shouldUpdate: GUIElement[] = []) {
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

        button.draggable(<any>{
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
                //button.css('left', ui.originalPosition.left);

                shouldUpdate.forEach((e) => { e.updateUI(); });
            },
            scroll: false,
        })
    }

	class Console /*extends Console*/ {
        private _console: Scrollable;
        private _button: JQuery = $('#consoleSubimt');
        private _input: JQuery = $('#consoleInput');
        private _holder: JQuery = $('#consoleInputHolder');
        constructor() {
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
            })
        }
        private addMessage(message: string, delimiterChar: string): JQuery {
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
        print(message: string) {
            return this.addMessage(message, '\|').animate({ backgroundColor: '#C0C0C0' }, 100).animate({ backgroundColor: 'transparent' }, 1000);
        }
        input(message: string) {
            return this.addMessage(message, '>');
        }
        printError(message: string) {
            return this.print(message).css('color', 'red');
        }
        printSuccess(message: string) {
            return this.print(message).css('color', 'green');
        }
        printInternalMessage(message: string) {
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
    export function getConsole(): Console {
        if (progremConsole == null)
            progremConsole = new Console();
        return progremConsole;
    }

    export function setAsTrash(element: JQuery) {
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

    export class Help {
        private element = $('<div></div>').addClass('help');
        private descriptions: { element: JQuery; content: JQuery }[] = [];
        private displayed = false;
        constructor(button: JQuery) {
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
        addDescription(relatedElement: JQuery, content: JQuery) {
            this.descriptions.push({
                element: relatedElement,
                content: content
            });
        }
    }

    class Indicator implements GUIElement {
        private element: JQuery = GUI.empty();
        private indicator: JQuery = $('<div></div>').addClass('indicator');
        
        constructor(_class: string) {
            this.indicator.addClass(_class);
            this.element.append(this.indicator);

            window.setInterval(() => {
                this.updateUI();
            }, 1000);
        }
        private indicatedElement: L.LogicElementObserver;
        indicate(element: L.LogicElementObserver) {
            this.indicatedElement = element;
            this.updateUI();
        }
        hide() {
            this.indicatedElement = null;
            this.updateUI();
        }
        getElement(): JQuery {
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
    var executionIndicator: Indicator;
    export function getExecutionIndicator(): Indicator {
        if (executionIndicator == null)
            executionIndicator = new Indicator('executionIndicator');

        return executionIndicator;
    }

    export class Slider {
        holder = $('<div></div>').addClass('sliderHolder');
        button = $('<div></div>').addClass('sliderButton');

        constructor(
            private min: number,
            private max: number,
            private value: number,
            private onValueChenge: (newValue: number) => any) {

            this.holder.append(this.button);

            this.button.draggable(<any>{
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

        getElement(): JQuery {
            return this.holder;
        }
    }

    export class CheckBox {
        button = $('<div></div>').addClass('checkBoxButton');
        tick = $('<p class="glyphicon glyphicon-ok"></p>').addClass('checkBoxButtonTick');

        private setValue(value: boolean) {
            this.value = value;

            if (this.value)
                this.tick.show();
            else
                this.tick.hide();

            this.onValueChenge(value);
        }

        constructor(
            private value: boolean,
            private onValueChenge: (newValue: boolean) => any) {

            this.button.append(this.tick);

            this.button.click(() => {
                this.setValue(!this.value);
            });

            this.setValue(value);
        }

        getElement(): JQuery {
            return this.button;
        }
    }

    class ElementInfo {
        private element: JQuery;
        constructor() {
            this.element = $('<div></div>');
            this.element.addClass('elementInfo');
            $('body').append(this.element);

            window.setInterval(() => {
                this.updateOffser(true);
            }, 1000);
        }
        private hovered: L.LogicElementObserver = null;
        hideInfo() {
            this.hovered = null;
            this.element.hide();
        }
        infoFor(hovered: L.LogicElementObserver) {
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
                description.text(text)
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
    var elementInfo: ElementInfo = null;
    export function getElementInfo(): ElementInfo {
        if (!elementInfo)
            elementInfo = new ElementInfo();
        return elementInfo;
    }

    export function disableMenuButton(button: JQuery) {
        button.addClass('menuButtonDisabled');
    }

    export function enableMenuButton(button: JQuery) {
        button.removeClass('menuButtonDisabled');
    }

    //export function getKetOfColor(color: string, borderColor: string) : JQuery {
    //    var key = $('<div></div>').addClass('key');
    //    var left = $('<div></div>').addClass('leftKey');
    //    var center = $('<canvas></canvas>').addClass('centerKey');
    //    var right = $('<div></div>').addClass('rightKey');

    //    key.append(left).append(center).append(right);

    //    var context = (<any> center.get(0)).getContext("2d");
    //    context.canvas.height = 10;
    //    context.canvas.width = 15;

    //    context.beginPath();
    //    context.strokeStyle = borderColor;
    //    context.fillStyle = color;
    //    context.lineWidth = 2;
    //    context.moveTo(0, 10);
    //    context.lineTo(5, 5);
    //    context.lineTo(10, 5);
    //    context.lineTo(15, 10);
    //    context.stroke();
    //    context.lineTo(15, 0);
    //    context.lineTo(0, 0);
    //    context.fill();

    //    return key;
    //}
    export function svgElement(tagName): JQuery {
        return $(document.createElementNS("http://www.w3.org/2000/svg", tagName));
    }
}




