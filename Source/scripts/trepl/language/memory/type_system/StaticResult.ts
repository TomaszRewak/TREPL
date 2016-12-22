import { Type } from './Base'

export interface StaticResult { varType: Type }

export class RValue implements StaticResult { constructor(public varType: Type) { } }
export function rValue(type: Type): RValue { return new RValue(type); }

export class LValue extends RValue { }
export function lValue(type: Type): LValue { return new LValue(type); }