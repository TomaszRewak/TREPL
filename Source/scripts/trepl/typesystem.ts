module TS { // TypeSystem
    import TSO = TypeSystemObserver;

    //////////////////////// Additional ////////////////////////


    export class EnclosedValue extends L.IDeclaration {
        constructor(public name: string, private value: TS.Obj) {
            super(name);
            this.value = value.getCopy();
        }

        expectsType: TS.StaticResult = null;

        *createTempValue(environment: Memory.Environment): IterableIterator<L.Operation> {
            environment.pushTempValue(this.value.getCopy());

            yield Operation.memory(this);
            return;
        }

        *instantiate(environment: Memory.Environment): IterableIterator<L.Operation> {
            environment.addValueToStack(environment.popTempValue().getValue(), this.name);
            return;
        }

        *execute(environment: Memory.Environment): IterableIterator<L.Operation> {
            yield* this.createTempValue(environment);
            yield* this.instantiate(environment);
            yield Operation.memory(this);
            return;
        }
    }

    export class ImplicitDeclaration extends L.IDeclaration {
        constructor(public name: string, public expectsType: TS.StaticResult, private prototype: Prototype) {
            super(name);
        }

        *createTempValue(environment: Memory.Environment): IterableIterator<L.Operation> {
            if (this.expectsType instanceof RValueOfType) {
                environment.pushTempValue(this.prototype.defaultValue());
            }
            else {
                throw 'Cannot declare alias. Alias field has to be defined as well.';
            }
            return;
        }

        *instantiate(environment: Memory.Environment): IterableIterator<L.Operation> {
            if (this.expectsType instanceof RValueOfType) {
                environment.addValueToStack(environment.popTempValue().getValue().getCopy(), this.name);
            }
            else {
                environment.addAliasToStack(environment.popTempValue(), this.name);
            }

            return;
        }

        *execute(environment: Memory.Environment): IterableIterator<L.Operation> {
            yield* this.createTempValue(environment);
            yield* this.instantiate(environment);
            yield Operation.memory(this);
            return;
        }
    }

    //////////////////////// Objects ////////////////////////
   

    export class ClassField extends Memory.MemoryField implements DS.INamed {
        observer = new TSO.ClassFieldObserver(this);
        constructor(public declaration: L.IDeclaration, public name: string) {
            super();
        }
    }
    export class ClassFieldType {
        constructor(
            public name: string,
            public typ: Type)
        { }
    }

    //export class FunctionParapeter extends Memory.MemoryField implements DataStructures.INamed {
    //    observer = new TSO.ClassFieldObserver(this);
    //    constructor(public declaration: L.IDeclaration, public name: string) {
    //        super();
    //    }
    //}
    export class FunctionParapeterType {
        constructor(
            public name: string,
            public paramType: StaticResult,
            public hasDefaultValue: boolean)
        { }
    }

    export class Class extends Prototype {
        constructor(
            public classType: ClassType,
            public fields: { [name: string]: ClassField },
            functions: { [name: string]: FunctionObject }
		) {
            super(functions);
        }
        public getCopy(): Class {
            return new Class(this.classType, this.fields, this.functions);
        }
        defaultValue(): Instance {
            return new ClassObject(this);
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
        declaresType(): ClassObjectType {
            return new ClassObjectType(this);
        }
    }

    export class BaseClass extends Class {
        constructor(
            classType: ClassType,
            functions: { [name: string]: FunctionObject }) {
            super(classType, {}, functions);
        }
        getObjectOfValue(value: any): BaseClassObject {
            return new BaseClassObject(this, value);
        }
    }

    export class ClassObjectField extends Memory.MemoryField implements DS.INamed {
        observer = new TSO.ClassFieldObserver(this);
        constructor(value: Obj, public name: string) {
            super();

            this.setValue(value);
        }
    }

    export class ClassObject extends Instance {
        observer: TSO.ObjectObserver = new TSO.ClassObjectObserver(this);
        fields: { [id: string]: ClassObjectField } = {};
        constructor(
            public prototype: Class) {
            super(prototype);
        }
        public *construct(environment: Memory.Environment): IterableIterator<L.Operation> {

            var classFields = this.prototype.fields;

            for (var name in classFields) {
                var classField = classFields[name];
                var declaration = classField.declaration;

                yield* declaration.createTempValue(environment);
                var value = environment.popTempValue().getValue();

                this.fields[name] = new ClassObjectField(
                    value,
                    classField.name
				);
            }

            return;
        }
        public getCopy(): ClassObject { // TODO: copy also actual values
            var newObject = new ClassObject(
                this.prototype);

            var fields = this.prototype.fields;
            for (var fieldName in this.fields) {
                var field = this.fields[fieldName];
                newObject.fields[fieldName] = new ClassObjectField(
                    field.getValue().getCopy(),
                    field.name
				);
            }

            return newObject;
        }
        public hasFieldValue(name: string): boolean {
            return this.fields[name] != null;
        }
        public getFieldValue(name: string): Memory.MemoryField {
            return this.fields[name];
        }
    }
    export class ClassObjectType extends InstanceType {
        constructor(
            public prototypeType: ClassType
		) { super(prototypeType); }
        assignalbeTo(second: InstanceType): boolean {
            return (second instanceof ClassObjectType) && (this.prototypeType == second.prototypeType);
        }
    }

    export class VoidObject extends ClassObject {
        observer = new TSO.VoidObjectObserver(this);
        constructor(public prototye: Class) {
            super(prototye);
        }
        public getCopy(): VoidObject {
            return new VoidObject(this.prototye);
        }
    }

    export class BaseClassObject extends ClassObject {
        observer = new TSO.BaseClassObjectObserver(this);
        constructor(public prototye: BaseClass, public rawValue) {
            super(prototye);
        }
        public getCopy(): BaseClassObject {
            return new BaseClassObject(this.prototye, this.rawValue);
        }
    }

    export class FunctionClass extends Prototype {
        constructor() {
            super({});
        }
    }
    export class FunctionClassType extends PrototypeType {
        constructor(
            public parameters: FunctionParapeterType[],
            public returnType: StaticResult
		) {
            super('(' + parameters.map(e => e.paramType.varType.getTypeName()).join(', ') + ') => ' + returnType.varType.getTypeName(), {});
        }
        declaresType(): FunctionType {
            return new FunctionType(this);
        }
    }

    export class FunctionObject extends Instance {
        observer = new TSO.FunctionObserver(this);
        *call(environment: Memory.Environment, passedArguments: number): IterableIterator<L.Operation> {
            environment.addScope('Function Call');

            for (var i = 0; i < this.closure.length; i++) {
                var enclosedValue = this.closure[i];
                yield* enclosedValue.execute(environment);
            }

            for (var i = 0; i < this.parameters.length; i++) {
                yield* this.parameters[i].instantiate(environment);
            }

            yield* this.behaviour(environment);

            environment.removeScope();

            return;
        }
        constructor(
            public prototype: FunctionClass,
            public parameters: L.IDeclaration[],
            public behaviour: (environment: Memory.Environment) => IterableIterator<L.Operation>,
            public closure: L.IDeclaration[] = [])
        { super(prototype); }
        public getCopy(): FunctionObject {
            return new FunctionObject(this.prototype, this.parameters, this.behaviour, this.closure);
        }
    }
    export class FunctionType extends InstanceType {
        constructor(
            public prototypeType: FunctionClassType
		) { super(prototypeType); }
    }

    export class Method extends FunctionObject {
        constructor(
            thisField: Memory.MemoryField,
            baseFunction: FunctionObject,
            alaisedThis: boolean
		) {
            var thisValue = alaisedThis ? null : thisField.getValue().getCopy();
            super(
                baseFunction.prototype,
                baseFunction.parameters,
                alaisedThis ?
                    function* (environment: Memory.Environment) {
                        environment.addAliasToStack(
                            thisField,
                            'this'
						);

                        yield* baseFunction.behaviour(environment);
                    }
                    :
                    function* (environment: Memory.Environment) {
                        environment.addValueToStack(
                            thisValue.getCopy(),
                            'this'
						);

                        yield* baseFunction.behaviour(environment);
                    },
                baseFunction.closure
			);
        }
    }

    export class ArrayClass extends Prototype {
        constructor(
            public elementsClass: Prototype,
            public length: number
		) {
            super({});
        }
        defaultValue(): Instance {
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

    export class ArrayField extends Memory.MemoryField {
        observer = new TSO.ArrayFieldObserver(this);
        constructor(value: TS.Obj, public index: number) {
            super();
            this.setValue(value);
        }
    }
    export class ArrayObject extends Instance {
        observer: TSO.ArrayObjectObserver = new TSO.ArrayObjectObserver(this);
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
        public getField(index: number): Memory.MemoryField {
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
                yield* (<TS.Instance>this.values[i].getValue()).construct(environment);

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
    export class ReferenceClass extends Prototype {
        constructor(public referencedPrototype: Prototype) {
            super({});
            this.functions['=='] = new FunctionObject(
                new FunctionClass(),
                [
                    new ImplicitDeclaration('b', rValue(null), Int.classInstance)
                ],
                function* (environment) {
                    var a = <Reference>environment.getFromStack('this').getValue();
                    var b = <Reference>environment.getFromStack('b').getValue();
                    var result = Boolean.classInstance.getObjectOfValue(a.reference == b.reference);
                    environment.pushTempValue(result);
                }
			);
            this.functions['!='] = new FunctionObject(
                new FunctionClass(),
                [
                    new ImplicitDeclaration('b', rValue(null), Int.classInstance)
                ],
                function* (environment) {
                    var a = <Reference>environment.getFromStack('this').getValue();
                    var b = <Reference>environment.getFromStack('b').getValue();
                    var result = Boolean.classInstance.getObjectOfValue(a.reference != b.reference);
                    environment.pushTempValue(result);
                }
			);
        }
        defaultValue(): Instance {
            return new Reference(this, null);
        }
    }
    export class Reference extends Instance {
        observer: TSO.ReferenceObserver = new TSO.ReferenceObserver(this);
        constructor(
            public prototype: ReferenceClass,
            public reference: Memory.MemoryField
		) {
            super(prototype);
            if (reference)
                reference.referencedBy(this);
        }
        public getCopy(): Reference {
            return new Reference(this.prototype, this.reference);
        }
    }

    export class Alias extends Reference {
        observer: TSO.AliasObserver = new TSO.AliasObserver(this);
    }

    //////////////////////// Types ////////////////////////

    export class Void extends Class {
        static typeInstance: ClassType = null;
        static objectTypeInstance: ClassObjectType = null;
        static classInstance: Void = null;

        private static initialized = false;
        static initialize() {
            if (!Void.initialized) {
                var typeInstance: ClassType = new ClassType({}, {}, 'void');
                var objectTypeInstance = new ClassObjectType(typeInstance);

                typeInstance.functions = {};
                var classInstance: Void = new Void(
                    typeInstance,
                    {}, {});

                this.typeInstance = typeInstance;
                this.objectTypeInstance = objectTypeInstance;
                this.classInstance = classInstance;

                Void.initialized = true;
            }
        }

        defaultValue(): ClassObject {
            return new VoidObject(this);
        }
    }
    Void.initialize();

    // Built in types
    function _base_typeToTypeMethodType(type: Type, returns: Type): FunctionClassType {
        return new FunctionClassType([
            new FunctionParapeterType('b', rValue(type), false)
        ], rValue(returns));
    }
    function _base_typeToTypeMethodOperation(operation: (a, b) => any, alocator: BaseClass) {
        return new FunctionObject(
            new FunctionClass(),
            [
                new ImplicitDeclaration('b', rValue(null), null)
            ],
            function* (environment) {
                var a = <BaseClassObject>environment.getFromStack('this').getValue();
                var b = <BaseClassObject>environment.getFromStack('b').getValue();
                environment.pushTempValue(alocator.getObjectOfValue(operation(a.rawValue, b.rawValue)));
            });
    }
    function _base_toTypeMethodType(returns: Type): FunctionClassType {
        return new FunctionClassType([
        ], rValue(returns));
    }
    function _base_toTypeMethodOperation(operation: (a) => any, alocator: BaseClass): FunctionObject {
        return new FunctionObject(
            new FunctionClass(),
            [],
            function* (environment) {
                var a = <BaseClassObject>environment.getFromStack('this').getValue();
                environment.pushTempValue(alocator.getObjectOfValue(operation(a.rawValue)));
            });
    }
    function _base_printMethod(formatter = (a) => a): FunctionObject {
        return new FunctionObject(
            new FunctionClass(),
            [],
            function* (environment) {
                var a = <BaseClassObject>environment.getFromStack('this').getValue();
                GUI.getConsole().print(formatter(a.rawValue));
            });
    }
    function _base_scanMethod(formatter = (a) => a): FunctionObject {
        return new FunctionObject(
            new FunctionClass(),
            [],
            function* (environment) {
                var a = <BaseClassObject>environment.getFromStack('this').getValue();
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

    export class Boolean extends BaseClass {
        static typeInstance: ClassType = null;
        static objectTypeInstance: ClassObjectType = null;
        static classInstance: Boolean = null;

        private static initialized = false;
        static initialize() {
            if (!Boolean.initialized) {
                var typeInstance: ClassType = new ClassType({}, {}, 'boolean');
                var objectTypeInstance: ClassObjectType = new ClassObjectType(typeInstance);

                var classInstance: Boolean = new Boolean(typeInstance, {});

                var _boolToBoolType = _base_typeToTypeMethodType(objectTypeInstance, objectTypeInstance);
                var _toBoolType = _base_toTypeMethodType(objectTypeInstance);
                var _toVoidType = _base_toTypeMethodType(Void.objectTypeInstance);

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
                classInstance.functions['scan'] = _base_scanMethod((a) => {
                    return a && a != 'false' && a != 'False';
                });

                this.typeInstance = typeInstance;
                this.objectTypeInstance = objectTypeInstance;
                this.classInstance = classInstance;

                Boolean.initialized = true;
            }
        }

        getObjectOfValue(value: boolean): BaseClassObject {
            return new BaseClassObject(this, value);
        }
        defaultValue(): Instance {
            return this.getObjectOfValue(false);
        }
    }
    Boolean.initialize();

    export class Int extends BaseClass {
        static typeInstance: ClassType = null;
        static objectTypeInstance: ClassObjectType = null;
        static classInstance: Int = null;

        private static initialized = false;
        static initialize() {
            if (!Int.initialized) {
                var typeInstance: ClassType = new ClassType({}, {}, 'number');
                var objectTypeInstance: ClassObjectType = new ClassObjectType(typeInstance);
                var classInstance: Int = new Int(typeInstance, {});

                var _intToIntType = _base_typeToTypeMethodType(objectTypeInstance, objectTypeInstance);
                var _intToBooleanType = _base_typeToTypeMethodType(objectTypeInstance, Boolean.objectTypeInstance);
                var _toIntType = _base_toTypeMethodType(objectTypeInstance);
                var _toVoidType = _base_toTypeMethodType(Void.objectTypeInstance);

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
                classInstance.functions['=='] = _base_typeToTypeMethodOperation((a, b) => a == b, Boolean.classInstance);
                classInstance.functions['!='] = _base_typeToTypeMethodOperation((a, b) => a != b, Boolean.classInstance);
                classInstance.functions['<'] = _base_typeToTypeMethodOperation((a, b) => a < b, Boolean.classInstance);
                classInstance.functions['<='] = _base_typeToTypeMethodOperation((a, b) => a <= b, Boolean.classInstance);
                classInstance.functions['>'] = _base_typeToTypeMethodOperation((a, b) => a > b, Boolean.classInstance);
                classInstance.functions['>='] = _base_typeToTypeMethodOperation((a, b) => a >= b, Boolean.classInstance);
                classInstance.functions['print'] = _base_printMethod();
                classInstance.functions['scan'] = _base_scanMethod((a) => {
                    var numberValue = parseInt(a);
                    if (isNaN(numberValue))
                        numberValue = 0;
                    return numberValue;
                });
                classInstance.functions['++'] = new FunctionObject(
                    new FunctionClass(),
                    [],
                    function* (environment) {
                        var a = <BaseClassObject>environment.getFromStack('this').getValue();
                        a.rawValue++;
                        environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
                        a.observer.updateUI();
                    });
                classInstance.functions['--'] = new FunctionObject(
                    new FunctionClass(),
                    [],
                    function* (environment) {
                        var a = <BaseClassObject>environment.getFromStack('this').getValue();
                        a.rawValue--;
                        environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
                        a.observer.updateUI();
                    });
                classInstance.functions['_++'] = new FunctionObject(
                    new FunctionClass(),
                    [],
                    function* (environment) {
                        var a = <BaseClassObject>environment.getFromStack('this').getValue();
                        environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
                        a.rawValue++;
                        a.observer.updateUI();
                    });
                classInstance.functions['_--'] = new FunctionObject(
                    new FunctionClass(),
                    [],
                    function* (environment) {
                        var a = <BaseClassObject>environment.getFromStack('this').getValue();
                        environment.pushTempValue(classInstance.getObjectOfValue(a.rawValue));
                        a.rawValue--;
                        a.observer.updateUI();
                    });

                this.typeInstance = typeInstance;
                this.objectTypeInstance = objectTypeInstance;
                this.classInstance = classInstance;

                Int.initialized = true;
            }
        }

        getObjectOfValue(value: number): BaseClassObject {
            return new BaseClassObject(this, value);
        }
        defaultValue(): Instance {
            return this.getObjectOfValue(0);
        }
    }
    Int.initialize();

    export class String extends BaseClass {
        static typeInstance: ClassType = null;
        static objectTypeInstance: ClassObjectType = null;
        static classInstance: String = null;

        private static initialized = false;
        static initialize() {
            if (!String.initialized) {
                var typeInstance: ClassType = new ClassType({}, {}, 'string');
                var objectTypeInstance: ClassObjectType = new ClassObjectType(typeInstance);
                var classInstance: String = new String(typeInstance, {});

                var _stringToStringType = _base_typeToTypeMethodType(objectTypeInstance, objectTypeInstance);
                var _toIntType = _base_toTypeMethodType(Int.objectTypeInstance);
                var _toVoidType = _base_toTypeMethodType(Void.objectTypeInstance);

                typeInstance.functions = {
                    '+': _stringToStringType,
                    'length': _toIntType,
                    'print': _toVoidType,
                    'scan': _toVoidType
                };
                classInstance.functions['+'] = _base_typeToTypeMethodOperation((a, b) => a + b, classInstance);
                classInstance.functions['length'] = _base_toTypeMethodOperation((a) => a.length, Int.classInstance);
                classInstance.functions['print'] = _base_printMethod();
                classInstance.functions['scan'] = _base_scanMethod();

                this.typeInstance = typeInstance;
                this.objectTypeInstance = objectTypeInstance;
                this.classInstance = classInstance;

                String.initialized = true;
            }
        }

        getObjectOfValue(value: string): BaseClassObject {
            return new BaseClassObject(this, value);
        }
        defaultValue(): Instance {
            return this.getObjectOfValue("");
        }
    }
    String.initialize();
}