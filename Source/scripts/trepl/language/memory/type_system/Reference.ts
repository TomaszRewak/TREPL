import { PrototypeObj, PrototypeType } from './Prototype'
import { InstanceObj, InstanceType } from './Instance'
import { FunctionObj, FunctionClassObj, FunctionClassType, FunctionParapeterType } from './Function'
import { ImplicitDeclaration } from '../../flow/Declaration'
import { rValue } from './StaticResult'
import { } from '../memory_fields/MemoryField'

export class ReferenceClassObj extends PrototypeObj {
	constructor(public referencedPrototype: PrototypeObj) {
		super({});
		this.functions['=='] = new FunctionObj(
			new FunctionClassObj(),
			[
				new ImplicitDeclaration('b', rValue(null), Int.classInstance)
			],
			function* (environment) {
				var a = <ReferenceObj>environment.getFromStack('this').getValue();
				var b = <ReferenceObj>environment.getFromStack('b').getValue();
				var result = Boolean.classInstance.getObjectOfValue(a.reference == b.reference);
				environment.pushTempValue(result);
			}
		);
		this.functions['!='] = new FunctionObj(
			new FunctionClassObj(),
			[
				new ImplicitDeclaration('b', rValue(null), Int.classInstance)
			],
			function* (environment) {
				var a = <ReferenceObj>environment.getFromStack('this').getValue();
				var b = <ReferenceObj>environment.getFromStack('b').getValue();
				var result = Boolean.classInstance.getObjectOfValue(a.reference != b.reference);
				environment.pushTempValue(result);
			}
		);
	}
	defaultValue(): InstanceObj {
		return new ReferenceObj(this, null);
	}
}

export class ReferenceClassType extends PrototypeType {
	constructor(public referencedPrototypeType: PrototypeType) {
		super(referencedPrototypeType.instanceName + ' ref', {});
		this.functions['=='] = new FunctionClassType([
			new FunctionParapeterType('b', rValue(this.declaresType()), false)
		], rValue(TS.Boolean.objectTypeInstance));
		this.functions['!='] = new FunctionClassType([
			new FunctionParapeterType('b', rValue(this.declaresType()), false)
		], rValue(TS.Boolean.objectTypeInstance));
	}
	declaresType(): ReferenceType {
		return new ReferenceType(this);
	}
}

export class ReferenceObj extends InstanceObj {
	observer: TSO.ReferenceObserver = new TSO.ReferenceObserver(this);
	constructor(
		public prototype: ReferenceClassObj,
		public reference: MemoryField
	) {
		super(prototype);
		if (reference)
			reference.referencedBy(this);
	}
	public getCopy(): ReferenceObj {
		return new ReferenceObj(this.prototype, this.reference);
	}
}

export class ReferenceType extends InstanceType {
	constructor(
		public prototypeType: ReferenceClassType
	) { super(prototypeType); }
	assignalbeTo(second: InstanceType): boolean {
		if (!(second instanceof ReferenceType))
			return false;

		var a = this.prototypeType.referencedPrototypeType.declaresType().assignalbeTo((<ReferenceType>second).prototypeType.referencedPrototypeType.declaresType());
		var b = this.prototypeType.referencedPrototypeType == Void.typeInstance;
		return a || b;
	}
}

export class Alias extends ReferenceObj {
	observer: TSO.AliasObserver = new TSO.AliasObserver(this);
}