import { MemoryField, Environment } from '../../environment'
import { Observable } from '../../observer'
import { Operation } from '../flow'
import { Prototype, PrototypeType } from './Prototype'
import { Instance, InstanceType } from './Instance'
import { Value, Type } from './Base'

export class Array extends Instance {
	values: ArrayField[];
	constructor(
		public prototype: ArrayClass
	) {
		super(prototype);
		this.values = [];
		for (var i = 0; i < prototype.length; i++) {
			var memoryField = new ArrayField(prototype.elementsClass.defaultValue(), i);
			this.values[i] = memoryField;
		}
	}
	public getField(index: number): MemoryField {
		return this.values[index];
	}
	public getCopy(): Array { // TODO: copy also actual values
		var newObject = new Array(this.prototype);

		for (var i = 0; i < this.prototype.length; i++) {
			newObject.getField(i).setValue(this.values[i].getValue().getCopy());
		}

		return newObject;
	}
	public *construct(environment: Environment): IterableIterator<Operation> {
		for (var i = 0; i < this.prototype.length; i++)
			yield* (<InstanceValue>this.values[i].getValue()).construct(environment);

		return;
	}
}

export class ArrayField extends MemoryField {
	constructor(value: Value, public index: number) {
		super();
		this.setValue(value);
	}
}

export class ArrayClass extends Prototype {
	constructor(
		public elementsClass: Prototype,
		public length: number
	) {
		super({});
	}
	defaultValue(): InstanceValue {
		return new ArrayObj(this);
	}
}

export class ArrayType extends InstanceType {
	constructor(
		public prototypeType: ArrayClassType
	) { super(prototypeType); }
	assignalbeTo(second: Type): boolean {
		if (!(second instanceof ArrayType))
			return false;

		return this.prototypeType.elementsClass.declaresType().assignalbeTo((<ArrayType>second).prototypeType.elementsClass.declaresType());
	}
}

export class ArrayClassType extends PrototypeType {
	constructor(
		public elementsClass: PrototypeType
	) {
		super(elementsClass.declaresType().getTypeName() + '[]', {});
	}
	declaresType(): ArrayType {
		return new ArrayType(this);
	}
}

export class ArrayOfLengthClassType extends ArrayClassType {
	constructor(
		elementsClass: PrototypeType,
		public length: number
	) {
		super(elementsClass);
	}
	declaresType(): ArrayType {
		return new ArrayType(this);
	}
}