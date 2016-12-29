import * as Prototype from './Prototype'
import * as Instance from './Instance'
import * as Function from './Function'
import * as BaseTypes from './BaseTypes'
import * as MemoryFields from '../memory_fields'
import { ImplicitDeclaration } from '../flow/Declaration'
import { rValue } from './StaticResult'

export class ReferenceClassObj extends Prototype.PrototypeObj {
	constructor() {
		super({});
		this.functions['=='] = new Function.FunctionObj(
			new Function.FunctionClassObj(),
			[
				new ImplicitDeclaration('b', rValue(null), BaseTypes.IntClassObj.classInstance)
			],
			function* (environment) {
				var a = <ReferenceObj>environment.getFromStack('this').getValue();
				var b = <ReferenceObj>environment.getFromStack('b').getValue();
				var result = BaseTypes.BooleanClassObj.classInstance.getObjectOfValue(a.reference == b.reference);
				environment.pushTempValue(result);
			}
		);
		this.functions['!='] = new Function.FunctionObj(
			new Function.FunctionClassObj(),
			[
				new ImplicitDeclaration('b', rValue(null), BaseTypes.IntClassObj.classInstance)
			],
			function* (environment) {
				var a = <ReferenceObj>environment.getFromStack('this').getValue();
				var b = <ReferenceObj>environment.getFromStack('b').getValue();
				var result = BaseTypes.BooleanClassObj.classInstance.getObjectOfValue(a.reference != b.reference);
				environment.pushTempValue(result);
			}
		);
	}
	defaultValue(): Instance.InstanceObj {
		return new ReferenceObj(null);
	}
}

export class ReferenceClassType extends Prototype.PrototypeType {
	constructor(public referencedPrototypeType: Prototype.PrototypeType) {
		super(referencedPrototypeType.instanceName + ' ref', {});
		this.functions['=='] = new Function.FunctionClassType([
			new Function.FunctionParapeterType('b', rValue(this.declaresType()), false)
		], rValue(BaseTypes.BooleanClassObj.objectTypeInstance));
		this.functions['!='] = new Function.FunctionClassType([
			new Function.FunctionParapeterType('b', rValue(this.declaresType()), false)
		], rValue(BaseTypes.BooleanClassObj.objectTypeInstance));
	}
	declaresType(): ReferenceType {
		return new ReferenceType(this);
	}
}

export class ReferenceObj extends Instance.InstanceObj {
	observer: TSO.ReferenceObserver = new TSO.ReferenceObserver(this);
	constructor(
		public reference: MemoryFields.MemoryField
	) {
		super(new ReferenceClassObj());

		if (reference)
			reference.referencedBy(this);
	}
	public getCopy(): ReferenceObj {
		return new ReferenceObj(this.reference);
	}
}

export class ReferenceType extends Instance.InstanceType {
	constructor(
		public prototypeType: ReferenceClassType
	) { super(prototypeType); }
	assignalbeTo(second: Instance.InstanceType): boolean {
		if (!(second instanceof ReferenceType))
			return false;

		var a = this.prototypeType.referencedPrototypeType.declaresType().assignalbeTo((<ReferenceType>second).prototypeType.referencedPrototypeType.declaresType());
		var b = this.prototypeType.referencedPrototypeType == BaseTypes.VoidClassObj.typeInstance;
		return a || b;
	}
}

export class Alias extends ReferenceObj {
	observer: TSO.AliasObserver = new TSO.AliasObserver(this);

	public dereference(): MemoryFields.MemoryField {
		return this.reference;
	}
}