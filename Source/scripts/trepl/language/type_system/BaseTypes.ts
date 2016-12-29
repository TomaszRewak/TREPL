import * as Function from './Function'
import * as Class from './Class'
import * as Instance from './Instance'
import { Type } from './Base'
import { rValue } from './StaticResult'
import { ImplicitDeclaration } from '../flow/Declaration'
import { Operation } from '../flow/Operation'

export class VoidClassInstanceObj extends Class.ClassInstanceObj {
	observer = new TSO.VoidObjectObserver(this);
	constructor(public prototye: Class.ClassObj) {
		super(prototye);
	}
	public getCopy(): VoidClassInstanceObj {
		return new VoidClassInstanceObj(this.prototye);
	}
}

export class VoidClassObj extends Class.ClassObj {
	static typeInstance: Class.ClassType = null;
	static objectTypeInstance: Class.ClassInstanceType = null;
	static classInstance: VoidClassObj = null;

	private static initialized = false;
	static initialize() {
		if (!VoidClassObj.initialized) {
			var typeInstance: Class.ClassType = new Class.ClassType({}, {}, 'void');
			var objectTypeInstance = new Class.ClassInstanceType(typeInstance);

			typeInstance.functions = {};
			var classInstance: VoidClassObj = new VoidClassObj(
				typeInstance,
				{}, {});

			this.typeInstance = typeInstance;
			this.objectTypeInstance = objectTypeInstance;
			this.classInstance = classInstance;

			VoidClassObj.initialized = true;
		}
	}

	defaultValue(): Class.ClassInstanceObj {
		return new VoidClassInstanceObj(this);
	}
}
VoidClassObj.initialize();

export class BaseClassObj extends Class.ClassObj {
	constructor(
		classType: Class.ClassType,
		functions: { [name: string]: Function.FunctionObj }) {
		super(classType, {}, functions);
	}
	getObjectOfValue(value: any): BaseClassInstanceObj {
		return new BaseClassInstanceObj(this, value);
	}
}

export class BaseClassInstanceObj extends Class.ClassInstanceObj {
	observer = new TSO.BaseClassObjectObserver(this);
	constructor(public prototye: BaseClassObj, public rawValue) {
		super(prototye);
	}
	public getCopy(): BaseClassInstanceObj {
		return new BaseClassInstanceObj(this.prototye, this.rawValue);
	}
}

function _base_typeToTypeMethodType(type: Type, returns: Type): Function.FunctionClassType {
	return new Function.FunctionClassType([
		new Function.FunctionParapeterType('b', rValue(type), false)
	], rValue(returns));
}
function _base_typeToTypeMethodOperation(operation: (a, b) => any, alocator: BaseClassObj) {
	return new Function.FunctionObj(
		new Function.FunctionClassObj(),
		[
			new ImplicitDeclaration('b', rValue(null), null)
		],
		function* (environment) {
			var a = <BaseClassInstanceObj>environment.getFromStack('this').getValue();
			var b = <BaseClassInstanceObj>environment.getFromStack('b').getValue();
			environment.pushTempValue(alocator.getObjectOfValue(operation(a.rawValue, b.rawValue)));
		});
}
function _base_toTypeMethodType(returns: Type): Function.FunctionClassType {
	return new Function.FunctionClassType([
	], rValue(returns));
}
function _base_toTypeMethodOperation(operation: (a) => any, alocator: BaseClassObj): Function.FunctionObj {
	return new Function.FunctionObj(
		new Function.FunctionClassObj(),
		[],
		function* (environment) {
			var a = <BaseClassInstanceObj>environment.getFromStack('this').getValue();
			environment.pushTempValue(alocator.getObjectOfValue(operation(a.rawValue)));
		});
}
function _base_printMethod(formatter = (a) => a): Function.FunctionObj {
	return new Function.FunctionObj(
		new Function.FunctionClassObj(),
		[],
		function* (environment) {
			var a = <BaseClassInstanceObj>environment.getFromStack('this').getValue();
			GUI.getConsole().print(formatter(a.rawValue));
		});
}
function _base_readMethod(formatter = (a) => a): Function.FunctionObj {
	return new Function.FunctionObj(
		new Function.FunctionClassObj(),
		[],
		function* (environment) {
			var a = <BaseClassInstanceObj>environment.getFromStack('this').getValue();
			environment.removeScope();

			var buffer = BufferManager.getBuffer();
			while (!buffer.hasConsoleInput()) {
				buffer.requestConsoleInput();
				yield Operation.wait();
			}
			var message = buffer.getConsoleInput();

			environment.addScope('');
			a.rawValue = formatter(message);
			a.observer.updateUI();
		});
}

export class BooleanClassObj extends BaseClassObj {
	static typeInstance: Class.ClassType = null;
	static objectTypeInstance: Class.ClassInstanceType = null;
	static classInstance: BooleanClassObj = null;

	private static initialized = false;
	static initialize() {
		if (!BooleanClassObj.initialized) {
			var typeInstance: Class.ClassType = new Class.ClassType({}, {}, 'boolean');
			var objectTypeInstance: Class.ClassInstanceType = new Class.ClassInstanceType(typeInstance);

			var classInstance: BooleanClassObj = new BooleanClassObj(typeInstance, {});

			var _boolToBoolType = _base_typeToTypeMethodType(objectTypeInstance, objectTypeInstance);
			var _toBoolType = _base_toTypeMethodType(objectTypeInstance);
			var _toVoidType = _base_toTypeMethodType(VoidClassObj.objectTypeInstance);

			typeInstance.functions = {
				'&&': _boolToBoolType,
				'||': _boolToBoolType,
				'!': _toBoolType,
				'print': _toVoidType,
				'scan': _toVoidType
			};
			classInstance.functions['&&'] = _base_typeToTypeMethodOperation((a, b) => a && b, classInstance);
			classInstance.functions['||'] = _base_typeToTypeMethodOperation((a, b) => a || b, classInstance);
			classInstance.functions['!'] = _base_toTypeMethodOperation((a) => !a, classInstance);
			classInstance.functions['print'] = _base_printMethod((a) => {
				return a ? 'true' : 'false';
			});
			classInstance.functions['read'] = _base_readMethod((a) => {
				return a && a != 'false' && a != 'False';
			});

			this.typeInstance = typeInstance;
			this.objectTypeInstance = objectTypeInstance;
			this.classInstance = classInstance;

			BooleanClassObj.initialized = true;
		}
	}

	getObjectOfValue(value: boolean): BaseClassInstanceObj {
		return new BaseClassInstanceObj(this, value);
	}
	defaultValue(): Instance.InstanceObj {
		return this.getObjectOfValue(false);
	}
}
BooleanClassObj.initialize();

export class IntClassObj extends BaseClassObj {
	static typeInstance: Class.ClassType = null;
	static objectTypeInstance: Class.ClassInstanceType = null;
	static classInstance: IntClassObj = null;

	private static initialized = false;
	static initialize() {
		if (!IntClassObj.initialized) {
			var typeInstance: Class.ClassType = new Class.ClassType({}, {}, 'number');
			var objectTypeInstance: Class.ClassInstanceType = new Class.ClassInstanceType(typeInstance);
			var classInstance: IntClassObj = new IntClassObj(typeInstance, {});

			var _intToIntType = _base_typeToTypeMethodType(objectTypeInstance, objectTypeInstance);
			var _intToBooleanType = _base_typeToTypeMethodType(objectTypeInstance, BooleanClassObj.objectTypeInstance);
			var _toIntType = _base_toTypeMethodType(objectTypeInstance);
			var _toVoidType = _base_toTypeMethodType(VoidClassObj.objectTypeInstance);

			typeInstance.functions = {
				'+': _intToIntType,
				'-': _intToIntType,
				'*': _intToIntType,
				'/': _intToIntType,
				'%': _intToIntType,
				'==': _intToBooleanType,
				'!=': _intToBooleanType,
				'<': _intToBooleanType,
				'<=': _intToBooleanType,
				'>': _intToBooleanType,
				'>=': _intToBooleanType,
				'print': _toVoidType,
				'scan': _toVoidType,
				'++': _toIntType,
				'--': _toIntType,
				'_++': _toIntType,
				'_--': _toIntType
			};
			classInstance.functions['+'] = _base_typeToTypeMethodOperation((a, b) => a + b, classInstance);
			classInstance.functions['-'] = _base_typeToTypeMethodOperation((a, b) => a - b, classInstance);
			classInstance.functions['*'] = _base_typeToTypeMethodOperation((a, b) => a * b, classInstance);
			classInstance.functions['/'] = _base_typeToTypeMethodOperation((a, b) => a / b, classInstance);
			classInstance.functions['%'] = _base_typeToTypeMethodOperation((a, b) => a % b, classInstance);
			classInstance.functions['=='] = _base_typeToTypeMethodOperation((a, b) => a == b, BooleanClassObj.classInstance);
			classInstance.functions['!='] = _base_typeToTypeMethodOperation((a, b) => a != b, BooleanClassObj.classInstance);
			classInstance.functions['<'] = _base_typeToTypeMethodOperation((a, b) => a < b, BooleanClassObj.classInstance);
			classInstance.functions['<='] = _base_typeToTypeMethodOperation((a, b) => a <= b, BooleanClassObj.classInstance);
			classInstance.functions['>'] = _base_typeToTypeMethodOperation((a, b) => a > b, BooleanClassObj.classInstance);
			classInstance.functions['>='] = _base_typeToTypeMethodOperation((a, b) => a >= b, BooleanClassObj.classInstance);
			classInstance.functions['print'] = _base_printMethod();
			classInstance.functions['read'] = _base_readMethod((a) => {
				var numberValue = parseInt(a);
				if (isNaN(numberValue))
					numberValue = 0;
				return numberValue;
			});
			classInstance.functions['++'] = new Function.FunctionObj(
				new Function.FunctionClassObj(),
				[],
				function* (environment) {
					var a = <BaseClassInstanceObj>environment.getFromStack('this').getValue();
					a.rawValue++;
					environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
					a.observer.updateUI();
				});
			classInstance.functions['--'] = new Function.FunctionObj(
				new Function.FunctionClassObj(),
				[],
				function* (environment) {
					var a = <BaseClassInstanceObj>environment.getFromStack('this').getValue();
					a.rawValue--;
					environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
					a.observer.updateUI();
				});
			classInstance.functions['_++'] = new Function.FunctionObj(
				new Function.FunctionClassObj(),
				[],
				function* (environment) {
					var a = <BaseClassInstanceObj>environment.getFromStack('this').getValue();
					environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
					a.rawValue++;
					a.observer.updateUI();
				});
			classInstance.functions['_--'] = new Function.FunctionObj(
				new Function.FunctionClassObj(),
				[],
				function* (environment) {
					var a = <BaseClassInstanceObj>environment.getFromStack('this').getValue();
					environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
					a.rawValue--;
					a.observer.updateUI();
				});

			this.typeInstance = typeInstance;
			this.objectTypeInstance = objectTypeInstance;
			this.classInstance = classInstance;

			IntClassObj.initialized = true;
		}
	}

	getObjectOfValue(value: number): BaseClassInstanceObj {
		return new BaseClassInstanceObj(this, value);
	}
	defaultValue(): Instance.InstanceObj {
		return this.getObjectOfValue(0);
	}
}
IntClassObj.initialize();

export class StringClassObj extends BaseClassObj {
	static typeInstance: Class.ClassType = null;
	static objectTypeInstance: Class.ClassInstanceType = null;
	static classInstance: StringClassObj = null;

	private static initialized = false;
	static initialize() {
		if (!StringClassObj.initialized) {
			var typeInstance: Class.ClassType = new Class.ClassType({}, {}, 'string');
			var objectTypeInstance: Class.ClassInstanceType = new Class.ClassInstanceType(typeInstance);
			var classInstance: StringClassObj = new StringClassObj(typeInstance, {});

			var _stringToStringType = _base_typeToTypeMethodType(objectTypeInstance, objectTypeInstance);
			var _toIntType = _base_toTypeMethodType(IntClassObj.objectTypeInstance);
			var _toVoidType = _base_toTypeMethodType(VoidClassObj.objectTypeInstance);

			typeInstance.functions = {
				'+': _stringToStringType,
				'length': _toIntType,
				'print': _toVoidType,
				'scan': _toVoidType
			};
			classInstance.functions['+'] = _base_typeToTypeMethodOperation((a, b) => a + b, classInstance);
			classInstance.functions['length'] = _base_toTypeMethodOperation((a) => a.length, IntClassObj.classInstance);
			classInstance.functions['print'] = _base_printMethod();
			classInstance.functions['read'] = _base_readMethod();

			this.typeInstance = typeInstance;
			this.objectTypeInstance = objectTypeInstance;
			this.classInstance = classInstance;

			StringClassObj.initialized = true;
		}
	}

	getObjectOfValue(value: string): BaseClassInstanceObj {
		return new BaseClassInstanceObj(this, value);
	}
	defaultValue(): Instance.InstanceObj {
		return this.getObjectOfValue("");
	}
}
StringClassObj.initialize();