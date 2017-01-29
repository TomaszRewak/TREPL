import { Stack } from '../../data_structures'

import { IType } from './IType'
import { INamedType } from './INamedType'
import { ITypeField } from './ITypeField'
import { Context } from './Context'

export interface ICompiler {
	addElement(name: string, typ: IType);
	getElement(name: string): ITypeField;

	addScope();
	removeScope();

	addClosure();
	removeClosure(): { [name: string]: IType };

	getNamesOnStack(): Stack<INamedType>;

	addContext(context: Context);
	removeContext();
	isInContext(context: Context): boolean;

	addFunctionExpection(expection: IType);
	removeFunctionExpection();
	getFunctionExpection(): IType;
}