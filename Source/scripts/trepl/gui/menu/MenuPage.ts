class MenuPage implements GUI.GUIElement {
	private element: JQuery;
	private loadingIndicator: JQuery;
	constructor(private menu: Menu, private label: string, private content: GUI.GUIElement, backButtonName?: string) {
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

	getElement(): JQuery {
		return this.element;
	}
	updateUI() {
		this.content.updateUI();
	}
	setLoading(isLoading: boolean) {
		if (isLoading) {
			this.loadingIndicator.show(500);
		}
		else {
			this.loadingIndicator.hide(500);
		}
	}
}