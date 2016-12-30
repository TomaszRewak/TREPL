module L {
    var O = Operation;
    export class ClassDefinition extends LogicElement {
        constructor(
            public name: string,
            public log_extends: LogicElement,
            public log_list: LogicElement[]
            ) { super(); }

        extendsType: TS.Type;

        functionClosures: { [funName: string]: { [name: string]: TS.Type } } = {};

        _compile(environment: Compiler.TypeEnvironment) {
            var fields: { [name: string]: TS.ClassFieldType } = {};
            var functions: { [name: string]: TS.FunctionClassType } = {};

            this.prototype = new TS.ClassType(fields, functions, this.name);

            this.errorIfEmpty(this.log_extends);
            this.cs = this.log_extends.compile(environment) && this.cs;
            if (!this.cs) return false;

            this.extendsType = this.log_extends.returns.varType;
            this.errorIfNot(this.extendsType instanceof TS.PrototypeType, 'You can extend only other classes', this.log_extends);
            if (!this.cs) return false;

            environment.addElement(this.name, this.prototype);

            environment.addScope();
            environment.addClosure();

            for (var i = 0; i < this.log_list.length; i++) {
                var logElement = this.log_list[i];

                if (logElement instanceof EmptyElement) {
                    continue;
                }
                else if (logElement instanceof Function) {
                    var fun = <Function> logElement;

                    environment.addScope();
                    this.cs = fun.compileType(environment) && this.cs;
                    environment.removeScope();

                    if (!!functions[fun.name] || !!fields[fun.name])
                        this.error('Member of this name already exists (functions overloading is not supported yet)', logElement);

                    if (!fun.cs) continue;
                    
                    functions[fun.name] = fun.functionType;
                }
                else if (this.log_list[i] instanceof VarDefinition) {
                    var field = <VarDefinition> logElement;

                    environment.addScope();
                    this.cs = field.compile(environment) && this.cs;
                    environment.removeScope();

                    if (!!functions[field.name] || !!fields[field.name])
                        this.error('Member of this name already exists (functions overloading is not supported yet)', logElement);

                    if (!field.cs) continue;

                    fields[field.name] = new TS.ClassFieldType(
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
                    var fun = <Function> this.log_list[i];

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

            this.returns = new TS.RValueOfType(this.prototype);

            return this.cs;
        }

        prototype: TS.ClassType;

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            var fields: { [name: string]: TS.ClassField } = {};
            var functions: { [name: string]: TS.FunctionObject } = {};

            var newClass = new TS.Class(
                this.prototype,
                fields,
                functions
                );

            environment.addValueToStack(newClass, this.name);

            yield Operation.memory(this);

            for (var i = 0; i < this.log_list.length; i++) {
                if (this.log_list[i] instanceof VarDefinition) {
                    var field = <VarDefinition> this.log_list[i];

                    fields[field.name] = new TS.ClassField(
                        field,
                        field.name
                        );
                }
                if (this.log_list[i] instanceof Function) {
                    var fun = <Function> this.log_list[i];
                    var closure = this.functionClosures[fun.name];

                    functions[fun.name] = fun.createFunctionObject(environment, closure);
                }
            }

            return;
        }
    }
}

module E {
    export class ClassDefinition extends Element {
        getJSONName() { return 'ClassDefinition' }
        c_name: C.TextField
        c_extends: C.DropField
        c_list: C.DropList
        constructor(
            name = 'foo',
            extend: E.Element = null,
            list: E.Element[] = []) {
            super();
            this.c_name = new C.TextField(this, name),
            this.c_extends = new C.DropField(this, extend),
            this.c_list = new C.DropList(this, list)
            this.initialize([
                [
                    new C.Label('class'),
                    this.c_name,
                    new C.Label('extends'),
                    this.c_extends,
                ],
                [
                    new C.Label('{'),
                ],
                [
                    this.c_list,
                ],
                [
                    new C.Label('}'),
                ]
            ], ElementType.Type);
        }
        constructCode(): L.LogicElement {
            var logic = new L.ClassDefinition(
                this.c_name.getRawData(),
                this.c_extends.constructCode(),
                this.c_list.getLogicComponents()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new ClassDefinition(
                this.c_name.getRawData(),
                this.c_extends.getContentCopy(),
                this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
} 