import { ITypedEnvironment, IInstanceDefinition } from '../environment'
import { IType } from '../../compiler'

export class InstanceDefinition<Env extends ITypedEnvironment> implements IInstanceDefinition<Env> {


	gasMethod(name: string, params: IInstanceDefinition<Env>[]): boolean;

	getMethod(name: string, params: IInstanceDefinition<Env>[]): IFunction<Env>;

	isInstanceOf(definition: IInstanceDefinition<Env>): boolean;
}
