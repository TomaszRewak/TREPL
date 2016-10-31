module Errors {
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
    export function IsOfType(element: L.LogicElement, typ: TS.Type): boolean{
        if (!element.returns || element.returns.varType != typ) {
            //element.element.composedElement.addClass('badTypeError');
            return false;
        }
        else {
            //element.element.composedElement.removeClass('badTypeError');
            return true;
        }
    }
} 