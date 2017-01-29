import { MemoryField } from '../../environment'
import * as DataStructures from '../data_structures'
import { Instance, InstanceType } from './Instance'
import { Prototype, PrototypeType } from './Prototype'
import { Function } from './Function'
import { IDeclaration } from '../flow/Declaration'
import { Operation } from '../flow/Operation'
import { Value, Type } from './Base'

export class ClassField extends MemoryField implements DataStructures.INamed {
	constructor(public declaration: IDeclaration, public name: string) {
		super();
	}
}

export class ClassFieldType {
	constructor(
		public name: string,
		public typ: Type)
	{ }
}

export class ClassInstanceField extends MemoryField implements DataStructures.INamed {
	constructor(value: Value, public name: string) {
		super();

		this.setValue(value);
	}
}

export class Class extends Prototype {
	constructor(
		public classType: ClassType,
		public fields: { [name: string]: ClassField },
		functions: { [name: string]: Function }
	) {
		super(functions);
	}
	public getCopy(): Class {
		return new Class(this.classType, this.fields, this.functions);
	}
	defaultValue(): Instance {
		return new ClassInstanceValue(this);
	}
}

export class ClassInstance extends Instance {
	observer: TSO.ObjectObserver = new TSO.ClassObjectObserver(this);
	fields: { [id: string]: ClassInstanceField } = {};
	constructor(
		public prototype: ClassValue) {
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
	public getCopy(): ClassInstance { // TODO: copy also actual values
		var newObject = new ClassInstance(
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

export class ClassType extends PrototypeType {
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

export class ClassInstanceType extends Instance.InstanceType {
	constructor(
		public prototypeType: ClassType
	) { super(prototypeType); }
	assignalbeTo(second: Instance.InstanceType): boolean {
		return (second instanceof ClassInstanceType) && (this.prototypeType == second.prototypeType);
	}
}