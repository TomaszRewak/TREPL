module Menu {
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
		setLoading(isLoading: boolean)
		{
			if (isLoading) {
				this.loadingIndicator.show(500);
			}
			else {
				this.loadingIndicator.hide(500);
			}
		}
	}

	export class Menu implements GUI.GUIElement {
		constructor(private holder: JQuery, private programManager: Program.ProgramManager) {

		}
		getElement(): JQuery {
			return this.holder;
		}
		updateUI() {
			if (this.hasPages())
				this.topPage().updateUI();
		}

		private _pages: MenuPage[] = [];
		private hasPages(): boolean { return this._pages.length > 0; }
		private topPage(): MenuPage { return this._pages[this._pages.length - 1]; }

		private _currentNavigationToken: number = 0;
		private getNavigationToken(): number {
			return ++this._currentNavigationToken;
		}

		private static MENU_ANIMATION_DURATION = 300;
		navigateTo(page: MenuPage, token: number, instant?: boolean) {
			if (token != this._currentNavigationToken)
				return;
			if (this.hasPages()) {
				var topPage = this.topPage();
				topPage.setLoading(false);
				topPage.getElement().stop().animate({ opacity: 0, top: '-20px' }, instant ? 0 : Menu.MENU_ANIMATION_DURATION, () => {
					topPage.getElement().detach();
				});
			}
			page.getElement().stop().delay(instant ? 0 : Menu.MENU_ANIMATION_DURATION / 2).css({ opacity: 0, top: '20px' }).appendTo(this.holder).animate({ opacity: 1, top: '0' }, instant ? 0 : Menu.MENU_ANIMATION_DURATION)
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
			page.getElement().stop().delay(Menu.MENU_ANIMATION_DURATION / 2).css({ opacity: 0, top: '-20px' }).appendTo(this.holder).animate({ opacity: 1, top: '0' })
			page.updateUI();
			this.topPage().setLoading(false);
		}
		indicateLoading()
		{
			this.topPage().setLoading(true);
		}

		private generateMenuPageContent(content: { label: string, sublabel: string, icon: string, action: () => any, extraClass?: string, path?: string }[]): GUI.GUIElementWithContent {
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
		private generateMenuPage(title: string, content: { label: string, sublabel: string, icon: string, action: () => any, extraClass?: string, path?: string }[], backButtonName?: string): MenuPage {
			var menu = this.generateMenuPageContent(content);
			
			return new MenuPage(this, title, menu, backButtonName);
		}

		private _mainMenu: MenuPage;
		gotoMainMenu() {
			if (!this._mainMenu) {
				var content = [
					{ label: 'Toolbox', sublabel: 'Basic components using which you can build programs', icon: 'glyphicon-menu-right', action: () => { this.gotoToolbox(); } },
					{ label: 'Tutorials [work in progress]', sublabel: 'You can find ready to use programs here', icon: 'glyphicon-menu-right', action: () => { this.gotoSections(); } },
					{ label: 'Save/Load program', sublabel: 'Download your work to finish it later', icon: 'glyphicon-menu-right', action: () => { this.gotoSaveLoad(); } }
				];
				this._mainMenu = this.generateMenuPage('Menu', content);
			}

			this.navigateTo(this._mainMenu, this.getNavigationToken());
		}

		private _toolbox: MenuPage;
		gotoToolbox() {
			if (!this._toolbox) {
				var toolbox = new GUI.Pickable(GUI.empty());

				var tabs: [string, (a: JQuery, b: Menu.Menu) => void][] = [
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

		gotoElementPreviw(helper: MenuInflater.Helper) {
			var previewHolder = new GUI.Scrollable(GUI.empty());
			var preview = previewHolder.getContent().addClass('elementPreview');
			GUI.empty().addClass('elementPreviewElement').append(helper.element.getCopy().getElement()).appendTo(preview);
			GUI.empty().addClass('elementPreviewText').text(helper.description).appendTo(preview);
			GUI.empty().addClass('elementPreviewExample').append(helper.example.getElement()).appendTo(preview);
			GUI.empty().addClass('elementPreviewHint').text(helper.shortcut).appendTo(preview);

			var page = new MenuPage(this, helper.name, previewHolder, 'Toolbox');

			this.navigateTo(page, this.getNavigationToken());
		}

		goThroughNavigationTreeStep(sections, name: string, backName: string, path: string) {
			if (sections.length) {
				var content = sections.map((value, index) => {
					var newPath = path + (index + 1).toString() + '.';
					return {
						label: value.Name,
						sublabel: value.Description,
						icon: 'glyphicon-menu-right',
						action:
						value.IsSection ?
							() => { this.gotoSubsections(value.Id, value.Name, backName, newPath); }
							:
							() => { this.gotoLesson(value.Id, name) },
						path: newPath
					};
				});

				var page = this.generateMenuPage(name, content, backName);
				this.navigateTo(page, this.getNavigationToken(), true);

				for (var i = 0; i < sections.length; i++) {
					if (sections[i].Subsections.length) {
						var section = sections[i];
						this.goThroughNavigationTreeStep(
							sections[i].Subsections,
							section.Name,
							name,
							path + (i + 1).toString() + '.')
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
			$.getJSON('/api/sections', (data: any[]) => {
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

		gotoSubsections(id: string, name: string, backName: string, path: string) {
			var navigationToken = this.getNavigationToken();
			this.indicateLoading();
			$.getJSON('/api/sections/' + id, (data: { lessons: any[], sections: any[] }) => {
				var content = [].concat(
					data.sections.map((value, index) => {
						var newPath = path + (index + 1).toString() + '.';
						return {
							label: value.Name,
							sublabel: value.Description,
							icon: 'glyphicon-menu-right',
							action: () => { this.gotoSubsections(value.Id, value.Name, name, newPath) },
							path: newPath
						};
					})
				).concat(
					data.lessons.map((value, index) => {
						var newPath = path + (index + 1).toString() + '.';
						return {
							label: value.Name,
							sublabel: value.Description,
							icon: 'glyphicon-menu-right',
							action: () => { this.gotoLesson(value.Id, name) },
							path: newPath
						};
					})
					);

				var sections = this.generateMenuPage(name, content, backName);
				this.navigateTo(sections, navigationToken);
			});
		}

		private gotoLessonForLessonData(data, section: string, navigationToken: number) {
			var pickable = new GUI.Pickable(GUI.empty());

			var program = <E.Program>Serializer.deserialize(JSON.parse(data.Code));

			var content = [{
				label: 'Load code',
				sublabel: 'Load code of this example into "Your code" section',
				icon: 'glyphicon-pencil',
				action: () => { 
					this.programManager.stop();
					this.programManager.setProgram(<E.Program>program.getCopy());
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

			if ((<any>window).ga) {
				(<any>window).ga('send', 'pageview', url);
			}
		}
		gotoLesson(id: string, section: string) {
			var navigationToken = this.getNavigationToken();
			this.indicateLoading();
			$.getJSON('/api/lessons/' + id, (data) => {
				this.gotoLessonForLessonData(data, section, navigationToken);
			});
		}

		private _saveLoad: MenuPage;
		gotoSaveLoad() {
			if (!this._saveLoad) {
				var uploadForm = MemoryManager.createUploadForm(this.programManager).addClass('uploadForm');

				var content = [
					{ label: 'Save', sublabel: 'Download you program', icon: 'glyphicon-floppy-disk', action: () => { MemoryManager.downloadProgram(this.programManager) } },
					{ label: 'Open', sublabel: 'Upload previously downloaded program', icon: 'glyphicon-folder-open', action: () => { uploadForm.click() }, extraClass: 'uploadButton' }
				];
				this._saveLoad = this.generateMenuPage('Save/Load', content, 'Menu');

				var uploadButton = this._saveLoad.getElement().find('.uploadButton');
				uploadButton.before(uploadForm);
			}

			this.navigateTo(this._saveLoad, this.getNavigationToken());
		}
	}

	export function getMainMenu(): GUI.IDisplayable {
		throw 'not implemented exception';
	}
}