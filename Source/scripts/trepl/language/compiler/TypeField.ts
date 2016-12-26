import { NamedType } from './NamedType'
import { Type } from '../memory/type_system/Base'

export class TypeField extends NamedType {
	constructor(name: string, typ: Type, public level: number) {
		super(name, typ);
	}
}