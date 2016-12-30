import * as Lang from '../language'

import { Function } from './Function'
import { VarDefinition } from './Function'

export class ClassDefinition extends Lang.Logic.LogicElement {
	constructor(
		public name: string,
		public log_extends: Lang.Logic.LogicElement,
		public log_list: Lang.Logic.LogicElement[]
	) { super(); }

	extendsType: Lang.TypeSystem.Type;

	functionClosures: { [funName: string]: { [name: string]: Lang.TypeSystem.Type } } = {};

	_compile(environment: Lang.Compiler.TypeEnvironment) {
		var fields: { [name: string]: Lang.TypeSystem.ClassFieldType } = {};
		var functions: { [name: string]: Lang.TypeSystem.FunctionClassType } = {};

		this.prototype = new Lang.TypeSystem.ClassType(fields, functions, this.name);

		this.errorIfEmpty(this.log_extends);
		this.cs = this.log_extends.compile(environment) && this.cs;
		if (!this.cs) return false;

		this.extendsType = this.log_extends.returns.varType;
		this.errorIfNot(this.extendsType instanceof Lang.TypeSystem.PrototypeType, 'You can extend only other classes', this.log_extends);
		if (!this.cs) return false;

		environment.addElement(this.name, this.prototype);

		environment.addScope();
		environment.addClosure();

		for (var i = 0; i < this.log_list.length; i++) {
			var logElement = this.log_list[i];

			if (logElement instanceof Lang.Logic.EmptyElement) {
				continue;
			}
			else if (logElement instanceof Function) {
				var fun = <Function>logElement;

				environment.addScope();
				this.cs = fun.compileType(environment) && this.cs;
				environment.removeScope();

				if (!!functions[fun.name] || !!fields[fun.name])
					this.error('Member of this name already exists (functions overloading is not supported yet)', logElement);

				if (!fun.cs) continue;

				functions[fun.name] = fun.functionType;
			}
			else if (this.log_list[i] instanceof VarDefinition) {
				var field = <VarDefinition>logElement;

				environment.addScope();
				this.cs = field.compile(environment) && this.cs;
				environment.removeScope();

				if (!!functions[field.name] || !!fields[field.name])
					this.error('Member of this name already exists (functions overloading is not supported yet)', logElement);

				if (!field.cs) continue;

				fields[field.name] = new Lang.TypeSystem.ClassFieldType(
					field.name,
					field.expectsType.varType);
			}
			else {
				this.error('Expected field or method declaration', logElement);
				continue;
			}
		}

		environment.removeClosure();
		environment.removeScope();

		if (!this.cs) return false;

		environment.addScope();
		environment.addClosure();

		for (var i = 0; i < this.log_list.length; i++) {
			if (this.log_list[i] instanceof Function) {
				var fun = <Function>this.log_list[i];

				environment.addScope(); // Scope to hold this value
				environment.addClosure();

				environment.addElement('this', this.prototype.declaresType());
				this.cs = fun.compile(environment) && this.cs;

				this.functionClosures[fun.name] = environment.removeClosure();
				environment.removeScope();

				if (!this.cs) continue;
			}
		}

		environment.removeClosure();
		environment.removeScope();

		if (!this.cs) return false;

		this.returns = new Lang.TypeSystem.RValue(this.prototype);

		return this.cs;
	}

	prototype: Lang.TypeSystem.ClassType;

	*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
		var fields: { [name: string]: Lang.TypeSystem.ClassField } = {};
		var functions: { [name: string]: Lang.TypeSystem.FunctionObj } = {};

		var newClass = new Lang.TypeSystem.ClassObj(
			this.prototype,
			fields,
			functions
		);

		environment.addOnStack(newClass, this.name);

		yield Lang.Flow.Operation.memory(this);

		for (var i = 0; i < this.log_list.length; i++) {
			if (this.log_list[i] instanceof VarDefinition) {
				var field = <VarDefinition>this.log_list[i];

				fields[field.name] = new Lang.TypeSystem.ClassField(
					field,
					field.name
				);
			}
			if (this.log_list[i] instanceof Function) {
				var fun = <Function>this.log_list[i];
				var closure = this.functionClosures[fun.name];

				functions[fun.name] = fun.createFunctionObject(environment, closure);
			}
		}

		return;
	}
}