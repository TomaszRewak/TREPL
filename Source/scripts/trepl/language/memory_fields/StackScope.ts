import * as DataStructures from '../data_structures'
import { StackField } from './StackField'

export class StackScope extends DataStructures.Scope<StackField> {
	observer = new MO.ScopeObserver(this);
	constructor(public name: string) { super(); }
}