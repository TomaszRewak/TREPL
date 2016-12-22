import { LogicElement } from '../flow/LogicElement'
import { StaticResult } from '../memory/type_system/StaticResult'
import { Stack } from '../memory/data_structures/Stack'
import { Type } from '../memory/type_system/Base'

export interface LogicElementObserver {
	getElement(): JQuery;
	error(message: string);
	executing();
	constructCode(): LogicElement;
	clearErrors();
	compiled(resultType: StaticResult, visibleNames: Stack<Compiler.NamedType>, context: Type);
	getDescription(): string;
	getErrors(): string[];
	isDisplayingProgress(): boolean;
}

export class EmptyLogicElementObserver implements EmptyLogicElementObserver {
	getElement() { return null; }
	error(message: string) { }
	executing() { }
	constructCode(): LogicElement { return null; }
	clearErrors() { }
	compiled(resultType: StaticResult, visibleNames: Stack<Compiler.NamedType>, context: Type) { }
	getDescription(): string { return ''; }
	getErrors(): string[] { return []; }
	isDisplayingProgress(): boolean { return false; }
}