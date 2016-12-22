module TS { // TypeSystem
    import TSO = TypeSystemObserver;

    //////////////////////// Additional ////////////////////////

    //////////////////////// Objects ////////////////////////


    


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