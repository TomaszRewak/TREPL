import * as Elements from '../elements'
import * as Components from '../components'
import * as Lang from '../../language'
import * as TRE from '../../tre'

export class Comment extends Elements.Element {
	getJSONName() { return 'Comment' }
	c_data: Components.TextField;
	constructor(value: string = 'foo') {
		super();
		this.c_data = new Components.TextField(this, value);
		this.initialize([
			[new Components.Label('//'), this.c_data]
		], Elements.ElementType.Other);
	}
	constructCode(): Lang.Logic.LogicElement {
		var emptyElement = new Lang.Logic.EmptyElement();
		emptyElement.setObserver(this);
		return emptyElement;
	}
	getCopy(): Elements.Element {
		return new Comment(this.c_data.getRawData()).copyMetadata(this);
	}
}

export class MultilineComment extends Elements.Element {
	getJSONName() { return 'MultilineComment' }
	c_list: Components.DropList;
	constructor(list: Elements.Element[] = []) {
		super();
		this.c_list = new Components.DropList(this, list);
		this.initialize([
			[new Components.Label('/*')],
			[this.c_list],
			[new Components.Label('*/')]
		], Elements.ElementType.Other);
	}
	constructCode(): Lang.Logic.LogicElement {
		var emptyElement = new Lang.Logic.EmptyElement();
		emptyElement.setObserver(this);
		return emptyElement;
	}
	getCopy(): Elements.Element {
		return new MultilineComment(this.c_list.getContentCopy()).copyMetadata(this);
	}
}