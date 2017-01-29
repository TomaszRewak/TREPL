export function IsNotEmpty(element: JQuery): boolean {
	if (element.is(':empty')) {
		element.addClass('emptyError');
		return false;
	}
	else {
		element.removeClass('emptyError');
		return true;
	}
}

export function IsOfType(element: L.LogicElement, typ: TS.Type): boolean {
	if (!element.returns || element.returns.varType != typ) {
		return false;
	}
	else {
		return true;
	}
}