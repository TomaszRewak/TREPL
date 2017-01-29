import { Element } from './Element'

export class Serialized {
	constructor(
		public element: string,
		public params: (string | Serialized | Serialized[])[],
		public visible: boolean
	) { }

	static deserialize(serialized: Serialized): Element {
		var parameters = serialized.params.map((elem) => {
			if (typeof elem == 'string')
				return elem;
			if (elem instanceof Array) {
				var elements = [];
				for (var i = 0; i < elem.length; i++)
					elements.push(this.deserialize(elem[i]));
				return elements;
			}
			return this.deserialize(elem);
		});

		var element = <Element>new (Function.prototype.bind.apply(E[serialized.element], [null].concat(parameters)));
		element.shouldDisplayProgress(serialized.visible);
		return element;
	}

	static deserializeArray(serialized: Serialized[]): Element[] {
		return serialized.map((elem) => elem.deserialize());
	}
}