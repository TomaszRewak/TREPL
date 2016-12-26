import { Component } from './Component'

export abstract class FieldAcceptingDroppable extends Component implements E.ElementParent, L.LogicElementObserver, GUI.IEditableHelpresSource {
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

	abstract attachElement(element: E.Element);

	abstract detachElement();

	containsElement() {
		return this.elemCotent != null;
	}

	getContent(): E.Element {
		return this.elemCotent;
	}

	edited() {
		this.parent.edited();
	}

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
				var selected: E.Element = (<GUI.ElementHelper>helper).getHelper();
				selected.detachElement();
				this.attachElement(selected);

				GUI.setEditable(this.element, false);
			}
		}
		else if (helper instanceof GUI.StringHelper) {
			if (!this.containsElement()) {
				var selected: E.Element = new E.RawData((<GUI.StringHelper>helper).name);
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