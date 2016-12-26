import { Component } from './Component'
import { InstanceType } from '../../language/memory/type_system/Instance'
import { ClassType } from '../../language/memory/type_system/Class'

export class PenetratingTextField extends Component {
	constructor(private parent: E.Element, elemValue: string = null) {
		super('textField');
		GUI.makeEditableWithHelpers(
			this.element,
			parent,
			this);
		this.element.on('input', () => {
			parent.edited();
		});
		this.element.focus(() => {
			BufferManager.getBuffer().setSelectedElement(parent);
		});
		this.setValue(elemValue);
	}
	getRawData(): string {
		return this.element.text();
	}
	toJSONObject(): Object {
		return this.getRawData();
	}
	getHelpers(text: string): GUI.IDisplayable[] {
		var allHelpers = MenuInflater.allHelpers;

		var currentHelpers: GUI.IDisplayable[] = [new GUI.StringHelper(text, '')];

		var resultType = this.parent.getInnerContext();

		if (resultType) {
			if (resultType instanceof InstanceType) {
				var prototype = resultType.prototypeType;
				for (var funName in prototype.functions) {
					currentHelpers.push(
						new GUI.StringHelper(
							funName,
							prototype.functions[funName].declaresType().getTypeName()));
				}
				if (prototype instanceof ClassType) {
					for (var fieldName in prototype.fields) {
						currentHelpers.push(
							new GUI.StringHelper(
								fieldName,
								prototype.fields[fieldName].typ.getTypeName()));
					}
				}
			}
		}

		return currentHelpers;
	}
	helperSelected(helper: GUI.IDisplayable) {
		if (helper instanceof GUI.StringHelper) {
			var selected = (<GUI.StringHelper>helper).name;
			this.element.text(selected);
			this.parent.edited();
		}
		else throw 'Unrecognized helper';
	}
}