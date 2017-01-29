import { Prototype } from './Prototype'
import { Instance } from './Instance'
import { Function, FunctionClass } from './Function'
import * as BaseTypes from './BaseTypes'
import { IEnvironment, IMemoryField } from '../../environment'
import { ImplicitDeclaration } from '../flow/Declaration'
import { rValue } from './StaticResult'

export class ReferenceClass extends Prototype {
	constructor() {
		super({});
		this.functions['=='] = new Function(
			new FunctionClass(),
			[
				new ImplicitDeclaration('b', rValue(null), BaseTypes.IntClassValue.classInstance)
			],
			function* (environment) {
				var a = <Reference>environment.getFromStack('this').getValue();
				var b = <Reference>environment.getFromStack('b').getValue();
				var result = BaseTypes.BooleanClassValue.classInstance.getObjectOfValue(a.reference == b.reference);
				environment.pushTempValue(result);
			}
		);
		this.functions['!='] = new Function(
			new FunctionClass(),
			[
				new ImplicitDeclaration('b', rValue(null), BaseTypes.IntClassValue.classInstance)
			],
			function* (environment) {
				var a = <Reference>environment.getFromStack('this').getValue();
				var b = <Reference>environment.getFromStack('b').getValue();
				var result = BaseTypes.BooleanClassValue.classInstance.getObjectOfValue(a.reference != b.reference);
				environment.pushTempValue(result);
			}
		);
	}
	defaultValue(): Instance {
		return new Reference(null);
	}
}

export class ReferenceClassType extends Prototype.PrototypeType {
	constructor(public referencedPrototypeType: Prototype.PrototypeType) {
		super(referencedPrototypeType.instanceName + ' ref', {});
		this.functions['=='] = new Function.FunctionClassType([
			new Function.FunctionParapeterType('b', rValue(this.declaresType()), false)
		], rValue(BaseTypes.BooleanClassValue.objectTypeInstance));
		this.functions['!='] = new Function.FunctionClassType([
			new Function.FunctionParapeterType('b', rValue(this.declaresType()), false)
		], rValue(BaseTypes.BooleanClassValue.objectTypeInstance));
	}
	declaresType(): ReferenceType {
		return new ReferenceType(this);
	}
}

export class Reference extends Instance {
	constructor(
		public reference: IMemoryField
	) {
		super(new ReferenceClass());

		if (reference)
			reference.referencedBy(this);
	}
	public getCopy(): Reference {
		return new Reference(this.reference);
	}
}

export class ReferenceType extends Instance {
	constructor(
		public prototypeType: ReferenceClassType
	) { super(prototypeType); }
	assignalbeTo(second: Instance): boolean {
		if (!(second instanceof ReferenceType))
			return false;

		var a = this.prototypeType.referencedPrototypeType.declaresType().assignalbeTo((<ReferenceType>second).prototypeType.referencedPrototypeType.declaresType());
		var b = this.prototypeType.referencedPrototypeType == BaseTypes.VoidClassValue.typeInstance;
		return a || b;
	}
}

export class Alias extends Reference {
}