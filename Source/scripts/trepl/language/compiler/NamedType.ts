import { INamed } from '../memory/data_structures/INamed'
import { Type } from '../memory/type_system/Base'

export class NamedType implements INamed {
	constructor(public name: string, public typ: Type) { }
}