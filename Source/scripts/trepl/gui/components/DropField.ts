import { FieldAcceptingDroppable } from './FieldAcceptingDroppable'

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