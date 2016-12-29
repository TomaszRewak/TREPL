import * as MemoryFields from '../memory_fields'
import * as DataStructures from '../data_structures'
import * as Instance from './Instance'
import * as Prototype from './Prototype'
import * as Function from './Function'
import { IDeclaration } from '../flow/Declaration'
import { Operation } from '../flow/Operation'
import { Obj, Type } from './Base'

export class ClassField extends MemoryFields.MemoryField implements DataStructures.INamed {
	observer = new TSO.ClassFieldObserver(this);
	constructor(public declaration: IDeclaration, public name: string) {
		super();
	}
}

export class ClassInstanceField extends MemoryFields.MemoryField implements DataStructures.INamed {
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

export class ClassObj extends Prototype.PrototypeObj {
	constructor(
		public classType: ClassType,
		public fields: { [name: string]: ClassField },
		functions: { [name: string]: Function.FunctionObj }
	) {
		super(functions);
	}
	public getCopy(): ClassObj {
		return new ClassObj(this.classType, this.fields, this.functions);
	}
	defaultValue(): Instance.InstanceObj {
		return new ClassInstanceObj(this);
	}
}

export class ClassType extends Prototype.PrototypeType {
	constructor(
		public fields: { [name: string]: ClassFieldType },
		functions: { [name: string]: Function.FunctionClassType },
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

export class ClassInstanceObj extends Instance.InstanceObj {
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
	public getFieldValue(name: string): MemoryFields.MemoryField {
		return this.fields[name];
	}
}
export class ClassInstanceType extends Instance.InstanceType {
	constructor(
		public prototypeType: ClassType
	) { super(prototypeType); }
	assignalbeTo(second: Instance.InstanceType): boolean {
		return (second instanceof ClassInstanceType) && (this.prototypeType == second.prototypeType);
	}
}