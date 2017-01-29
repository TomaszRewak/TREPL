import { IValue, IEnvironment, IMemoryField } from '../../environment'
import { IType } from '../../compiler'
import { Operation } from './Executable'
import { IDeclaration } from './Declaration'

export interface IInstanceDefinition<Env extends IEnvironment> {
	gasMethod(name: string, params: IInstanceDefinition<Env>[]): boolean;
	getMethod(name: string, params: IInstanceDefinition<Env>[]): IFunction<Env>;
	isInstanceOf(definition: IInstanceDefinition<Env>): boolean;
}

export interface IInstance<Env extends IEnvironment> extends IValue {
	definition: IInstanceDefinition<Env>;
}

export interface IFunction<Env extends IEnvironment> extends IInstance<Env> {
	call(environment: Env, passedArguments: number): IterableIterator<Operation>;
}