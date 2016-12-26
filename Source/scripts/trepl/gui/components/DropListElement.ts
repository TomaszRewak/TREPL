import { FieldAcceptingDroppable } from './FieldAcceptingDroppable'
import { DropList } from './DropList'

export class DropListElement extends FieldAcceptingDroppable {
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
			var originalEvent = <any>e.originalEvent;
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