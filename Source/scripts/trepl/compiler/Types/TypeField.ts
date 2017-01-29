import { NamedType } from './NamedType'
import { IType } from '../Interfaces'

export class TypeField extends NamedType {
	constructor(name: string, typ: IType, public level: number) {
		super(name, typ);
	}
}