import { Scope } from '../data_structures/Scope'
import { StackField } from './StackField'

export class StackScope extends Scope<StackField> {
	observer = new MO.ScopeObserver(this);
	constructor(public name: string) { super(); }
}