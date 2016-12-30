﻿import * as Environment from '../environment'
import * as Executable from './Executable'

//export class IDeclaration implements Executable {
//	constructor(public name: string) {
//	}
//	*execute(environment: Memory.Environment): IterableIterator<Operation> {
//		yield* this.createTempValue(environment);
//		yield* this.instantiate(environment);
//		yield Operation.memory(this);
//		return;
//	}
//	*instantiate(environment: Memory.Environment): IterableIterator<Operation> {
//		throw 'abstract class member call';
//	}
//	*createTempValue(environment: Memory.Environment): IterableIterator<Operation> {
//		throw 'abstract class member call';
//	}
//	expectsType: StaticResult;
//}

export interface IDeclaration extends Executable.Executable {
	name: string;

	createTempValue(environment: Environment.Environment): IterableIterator<Executable.Operation>;
	instantiate(environment: Environment.Environment): IterableIterator<Executable.Operation>;
}