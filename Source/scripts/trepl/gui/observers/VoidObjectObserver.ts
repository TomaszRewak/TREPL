import * as Lang from '../../language'

export class VoidObjectObserver implements Lang.Observers.ObjectObserver {
	constructor(private object: Lang.TypeSystem.VoidClassObj) { }
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