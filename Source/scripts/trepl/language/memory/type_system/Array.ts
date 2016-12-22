import { PrototypeObj, PrototypeType } from './Prototype'
import { InstanceObj, InstanceType } from './Instance'
import { MemoryField } from '../memory_fields/MemoryField'
import { Obj, Type } from './Base'

export class ArrayField extends MemoryField {
	observer = new TSO.ArrayFieldObserver(this);
	constructor(value: Obj, public index: number) {
		super();
		this.setValue(value);
	}
}

export class ArrayClassObj extends PrototypeObj {
	constructor(
		public elementsClass: PrototypeObj,
		public length: number
	) {
		super({});
	}
	defaultValue(): InstanceObj {
		return new ArrayObject(this);
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

export class ArrayObject extends InstanceObj {
	observer: TSO.ArrayObjectObserver = new TSO.ArrayObjectObserver(this);
	values: ArrayField[];
	constructor(
		public prototype: ArrayClassObj
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
	public getCopy(): ArrayObject { // TODO: copy also actual values
		var newObject = new ArrayObject(this.prototype);

		for (var i = 0; i < this.prototype.length; i++) {
			newObject.getField(i).setValue(this.values[i].getValue().getCopy());
		}

		return newObject;
	}
	public *construct(environment: Memory.Environment): IterableIterator<L.Operation> {
		for (var i = 0; i < this.prototype.length; i++)
			yield* (<InstanceObj>this.values[i].getValue()).construct(environment);

		return;
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