import { ElementType } from './ElementType'
import { ElementParent } from './ElementParent'
import { HelperParent } from './HelperParent'
import { Component } from '../components/Component'
import { StaticResult } from '../../language/memory/type_system/StaticResult'
import { Type } from '../../language/memory/type_system/Base'
import { Stack } from '../../language/memory/data_structures/Stack'
import { LogicElement } from '../../language/flow/LogicElement'
import { LogicElementObserver } from '../../language/observers/LogicElementObserver'

var styles = {};
styles[ElementType.Value] = 'valueCodeElement';
styles[ElementType.Flow] = 'flowCodeElement';
styles[ElementType.Variable] = 'variableCodeElement';
styles[ElementType.Type] = 'typeSystemCodeElement';
styles[ElementType.Math] = 'mathCodeElement';
styles[ElementType.Function] = 'functionCodeElement';
styles[ElementType.Other] = 'otherCodeElement';
styles[ElementType.Program] = 'programCodeElement';

// Represents single element of the programm composed of predefind components and provids interface for user interaction
export abstract class Element implements LogicElementObserver {
	// Real JQuery element that has been generated for this element
	private composedElement: JQuery = null;
	// Parent holding element
	// If set to null, then element is just a helper
	parent: ElementParent = new HelperParent(this);
	// Manages css styles
	setStyle(elemType: ElementType) {
		if (styles[elemType])
			this.composedElement.addClass(styles[elemType]);
		else
			throw 'Unknown style';
	}
	clearStyles() {
		for (var i in styles)
			this.composedElement.removeClass(styles[i]);
	}
	// First parameter is new login object which correspond to this element
	// Second agrument is a list of components in this element
	constructor() { }
	private components: Component[][]
	initialize(components: Component[][], elemType: ElementType) {
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
			var event: any = e.originalEvent;

			if (event.attribute != 'handled') {
				event.attribute = 'handled';
				GUI.getElementInfo().infoFor(this);
			}
		});
		this.composedElement.mouseleave((e) => {
			GUI.getElementInfo().hideInfo();
		});

		this.composedElement.dblclick((e) => {
			var event: any = e.originalEvent;

			if (event.attribute != 'handled') {
				event.attribute = 'handled';
				this.shouldDisplayProgressPropagated(!this.isDisplayingProgress());
			}
		});

		this.composedElement.click((e) => {
			var event: any = e.originalEvent;

			if (event.elementSelected != 'selected') {
				event.elementSelected = 'selected';
				BufferManager.getBuffer().setSelectedElement(this);
			}
		});

		GUI.addStaticEvents(this.composedElement);
		GUI.addDynamicEvants(this.composedElement);
	}
	// Returns JQuery representation of element.
	getElement(): JQuery {
		return this.composedElement;
	}

	constructCode(): LogicElement {
		return null;
	}

	getCopy(): Element {
		return null;
	}

	// Detaches element from its parent
	detachElement() {
		this.parent.detachElement();
	}

	executing() {
		GUI.getExecutionIndicator().indicate(this);
	}

	private errors: string[] = [];
	clearErrors() {
		this.getElement().parent().removeClass('error');
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

	private wasCompiled = false;
	private resultType: StaticResult;
	private visibleNames: Stack<Compiler.NamedType> = null;
	private innerContext: Type = null;
	getDescription(): string {
		if (!this.wasCompiled)
			return '';

		if (this.resultType)
			return this.resultType.varType.getTypeName();
		else
			return 'compilation error'
	}
	getInnerContext(): Type {
		return this.innerContext;
	}

	edited() {
		if (this.parent)
			this.parent.edited();
	}

	compiled(resultType: StaticResult, visibleNames: Stack<Compiler.NamedType>, innerContext: Type) {
		this.resultType = resultType;
		this.visibleNames = visibleNames;
		this.innerContext = innerContext;
		this.wasCompiled = true;
	}

	// Determines if the progress made by executing this element should be highlighted
	private _isDisplayingProgress: boolean = true;
	isDisplayingProgress(): boolean { return this._isDisplayingProgress; }
	shouldDisplayProgress(should: boolean) {
		this._isDisplayingProgress = should;
		if (should)
			this.composedElement.removeClass('withoutProgress');
		else
			this.composedElement.addClass('withoutProgress');
	}
	withoutProgress(): Element {
		this.shouldDisplayProgress(false);
		return this;
	}
	shouldDisplayProgressPropagated(should: boolean): Element {
		this.propagate((element) => {
			element.shouldDisplayProgress(should);
		});
		return this;
	}

	// Copies metadata informations from provided element
	copyMetadata(fromElement: Element): Element {
		this.shouldDisplayProgress(fromElement.isDisplayingProgress());
		return this;
	}

	// Propagates given function on all child elements of this element
	propagate(fun: (element: Element) => void) {
		fun(this);
		this.components.forEach(
			(val) => {
				val.forEach(
					(val) => {
						val.propagate(fun);
					});
			});
	}

	abstract getJSONName(): string;
	toJSONObject(): Serializer.Serialized {
		var params: Serializer.Serialized[] = [];

		this.components.forEach(
			(val) => {
				val.forEach(
					(val) => {
						var v = <any>val;
						if (v.toJSONObject)
							params.push(v.toJSONObject());
					});
			});
		return {
			element: this.getJSONName(),
			params: params,
			visible: this.isDisplayingProgress()
		}
	}
} 