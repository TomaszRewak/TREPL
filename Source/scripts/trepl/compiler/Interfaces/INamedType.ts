import { INamed } from '../../data_structures/INamed'
import { IType } from './IType'

export interface INamedType extends INamed {
	typ: IType;
}