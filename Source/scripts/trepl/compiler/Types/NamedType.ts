import { IType, INamedType } from '../Interfaces'

export class NamedType implements INamedType {
	constructor(public name: string, public typ: IType) { }
}