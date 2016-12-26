import { Element } from './Element'

export interface ElementParent {
	detachElement();
	attachElement(element: Element);
	containsElement(): boolean;
	edited();
}