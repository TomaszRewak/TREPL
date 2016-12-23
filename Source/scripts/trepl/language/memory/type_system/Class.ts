import { MemoryField } from '../memory_fields/MemoryField'
import { INamed } from '../data_structures/INamed'
import { IDeclaration } from '../../flow/Declaration'
import { Operation } from '../../flow/Operation'
import { Obj, Type } from './Base'
import { InstanceObj, InstanceType } from './Instance'
import { PrototypeObj, PrototypeType } from './Prototype'
import { FunctionObj, FunctionClassType } from './Function'

export class ClassField extends MemoryField implements INamed {
	observer = new TSO.ClassFieldObserver(this);
	constructor(public declaration: IDeclaration, public name: string) {
		super();
	}
}

export class ClassInstanceField extends MemoryField implements INamed {
	observer = new TSO.ClassFieldObserver(this);
	constructor(value: Obj, public name: string) {
		super();

		this.setValue(value);
	}
}

export class ClassFieldType {
	constructor(
		public name: string,
		public typ: Type)
	{ }
}

export class ClassObj extends PrototypeObj {
	constructor(
		public classType: ClassType,
		public fields: { [name: string]: ClassField },
		functions: { [name: string]: FunctionObj }
	) {
		super(functions);
	}
	public getCopy(): ClassObj {
		return new ClassObj(this.classType, this.fields, this.functions);
	}
	defaultValue(): InstanceObj {
		return new ClassInstanceObj(this);
	}
}

export class ClassType extends PrototypeType {
	constructor(
		public fields: { [name: string]: ClassFieldType },
		functions: { [name: string]: FunctionClassType },
		className: string
	) {
		super(className, functions);
	}
	hasField(name: string): boolean {
		return this.fields[name] != null;
	}
	declaresType(): ClassInstanceType {
		return new ClassInstanceType(this);
	}
}

export class ClassInstanceObj extends InstanceObj {
	observer: TSO.ObjectObserver = new TSO.ClassObjectObserver(this);
	fields: { [id: string]: ClassInstanceField } = {};
	constructor(
		public prototype: ClassObj) {
		super(prototype);
	}
	public *construct(environment: Memory.Environment): IterableIterator<Operation> {

		var classFields = this.prototype.fields;

		for (var name in classFields) {
			var classField = classFields[name];
			var declaration = classField.declaration;

			yield* declaration.createTempValue(environment);
			var value = environment.popTempValue().getValue();

			this.fields[name] = new ClassInstanceField(
				value,
				classField.name
			);
		}

		return;
	}
	public getCopy(): ClassInstanceObj { // TODO: copy also actual values
		var newObject = new ClassInstanceObj(
			this.prototype);

		var fields = this.prototype.fields;
		for (var fieldName in this.fields) {
			var field = this.fields[fieldName];
			newObject.fields[fieldName] = new ClassInstanceField(
				field.getValue().getCopy(),
				field.name
			);
		}

		return newObject;
	}
	public hasFieldValue(name: string): boolean {
		return this.fields[name] != null;
	}
	public getFieldValue(name: string): MemoryField {
		return this.fields[name];
	}
}
export class ClassInstanceType extends InstanceType {
	constructor(
		public prototypeType: ClassType
	) { super(prototypeType); }
	assignalbeTo(second: InstanceType): boolean {
		return (second instanceof ClassInstanceType) && (this.prototypeType == second.prototypeType);
	}
}