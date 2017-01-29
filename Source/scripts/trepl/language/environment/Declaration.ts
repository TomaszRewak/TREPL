import { IEnvironment } from '../../environment'
import { IExecutable, Operation } from './Executable'

export interface IDeclaration<Env extends IEnvironment> extends IExecutable<Env> {
	name: string;

	createTempValue(environment: Env): IterableIterator<Operation>;
	instantiate(environment: Env): IterableIterator<Operation>;
}