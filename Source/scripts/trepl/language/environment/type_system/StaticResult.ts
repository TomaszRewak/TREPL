export interface StaticResult { varType: TS.Type }

export class RValue implements StaticResult { constructor(public varType: TS.Type) { } }
export function rValue(type: TS.Type): RValue { return new RValue(type); }

export class LValue extends RValue { }
export function lValue(type: TS.Type): LValue { return new LValue(type); }