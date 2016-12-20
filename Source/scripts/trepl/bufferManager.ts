﻿module BufferManager {
    class BufferManager {
        private _copiedElement: Serializer.Serialized;
        public hasCopiedElement(): boolean {
            return !!this._copiedElement;
        }
        public copyElement(element: E.Element) {
            this._copiedElement = element.toJSONObject();
        }
        public getCopy(): E.Element {
            if (!this.hasCopiedElement())
                throw 'No element in buffer';

            return Serializer.deserialize(this._copiedElement);
        }

        private _selectedElement: E.Element;
        public clearSelection() {
            if (this._selectedElement)
                this._selectedElement.getElement().removeClass('selectedElement');
            this._selectedElement = null;
        }
        public setSelectedElement(element: E.Element) {
            this.clearSelection();
            this._selectedElement = element;
            this._selectedElement.getElement().addClass('selectedElement');
        }
        public getSelectedElement(): E.Element {
            return this._selectedElement;
        }
        public hasSelectedElement(): boolean {
            return !!this._selectedElement;
        }

        private _consoleInput: string[] = [];
        public addConsoleInput(message: string) {
            this._consoleInput.push(message);
        }
        public hasConsoleInput(): boolean {
            return this._consoleInput.length > 0;
        }
        public getConsoleInput(): string {
            return this._consoleInput.shift();
        }
        public requestConsoleInput() {
            GUI.getConsole().requestConsoleInput();
        }
        public clearInputBuffer() {
            this._consoleInput = [];
        }
    }
    var _bufferManager = new BufferManager;
    export function getBuffer(): BufferManager {
        if (!_bufferManager)
            _bufferManager = new BufferManager();
        return _bufferManager;
    }

    $(() => {
        $(document).keydown((e) => {
            var event = <any> e.originalEvent;
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
            var event: any = e.originalEvent;
            if (!event || event.elementSelected != 'selected') {
                getBuffer().clearSelection();
            }
        });
    });
}