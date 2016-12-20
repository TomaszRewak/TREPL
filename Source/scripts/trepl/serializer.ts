module Serializer {
    export class Serialized {
        constructor(
            public element: string,
            public params: (string | Serialized | Serialized[])[],
            public visible: boolean
            ) { }
    }

    export function deserialize(serialized: Serialized): E.Element{
        var parameters = serialized.params.map((elem) => {
            if (typeof elem == 'string')
                return elem;
            if (elem instanceof Array) {
                var elements = [];
                for (var i = 0; i < elem.length; i++)
                    elements.push(deserialize(elem[i]));
                return elements;
            }
            return deserialize(<any> elem);
        });

        var element = <E.Element> new (Function.prototype.bind.apply(E[serialized.element], [null].concat(parameters)));
        element.shouldDisplayProgress(serialized.visible);
        return element;
    }

    export function deserializeArray(serialized: Serialized[]): E.Element[]{
        return serialized.map((elem) => deserialize(elem));
    }
}