import * as Environment from '../environment'
import * as Executable from './Executable'

export interface IDeclaration extends Executable.Executable {
	name: string;

	createTempValue(environment: Environment.Environment): IterableIterator<Executable.Operation>;
	instantiate(environment: Environment.Environment): IterableIterator<Executable.Operation>;
}