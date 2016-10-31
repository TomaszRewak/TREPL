module L {
    export class Function extends LogicElement {
        constructor(
            public name: string,
            public log_arguments: LogicElement[],
            public log_return: LogicElement,
            public log_list: LogicElement[]
            ) { super(); }

        parameters: TS.FunctionParapeterType[];
        functionType: TS.FunctionClassType;
        declarations: L.IDeclaration[];

        closure: { [name: string]: TS.Type };
        enclosedValues: TS.EnclosedValue[];

        private typeCompiled = false;
        compileType(environment: Compiler.TypeEnvironment): boolean {
            if (this.typeCompiled) return this.cs;
            else this.typeCompiled = true;

            this.parameters = [];
            this.declarations = [];

            this.errorIfEmpty(this.log_return);
            this.cs = this.log_return.compile(environment) && this.cs;
            if (!this.cs) return false;

            var returnType = (<TS.PrototypeType> this.log_return.returns.varType).declaresType();

            var usedNames: { [name: string]: boolean } = {};

            for (var i = 0; i < this.log_arguments.length; i++) {
                if (this.log_arguments[i] instanceof EmptyElement)
                    continue;

                this.errorIfNot(this.log_arguments[i] instanceof IDeclaration, 'Expected parameter declaration', this.log_arguments[i]);
                if (!this.cs) continue;

                var declaration = <IDeclaration> this.log_arguments[i];
                environment.addScope();
                this.cs = declaration.compile(environment) && this.cs;
                environment.removeScope();

                if (!!usedNames[declaration.name]) {
                    this.error("Parameter of this name already exists", declaration);
                    continue;
                }
                usedNames[declaration.name] = true;

                if (!declaration.cs) continue;

                var parameter = new TS.FunctionParapeterType(
                    declaration.name,
                    declaration.expectsType,
                    declaration instanceof L.IDeclaration
                    );

                this.parameters[this.parameters.length] = parameter;
                this.declarations[this.declarations.length] = declaration;
            }

            if (!this.cs) return false;

            this.functionType = new TS.FunctionClassType(this.parameters, TS.rValue(returnType));

            return this.cs;
        }

        _compile(environment: Compiler.TypeEnvironment): boolean {

            environment.addScope();
            environment.addClosure();

            this.compileType(environment);

            for (var i = 0; i < this.declarations.length; i++) {
                var declaration = this.declarations[i];
                environment.addElement(declaration.name, declaration.expectsType.varType);
            }

            environment.addElement(this.name, new TS.FunctionType(this.functionType));

            var returnsType = this.functionType.returnType.varType;

            environment.addContext(Compiler.Context.Function);
            environment.addFunctionExpection(this.functionType.returnType.varType);
            var flowState = this.compileBlock(environment, this.log_list);
            this.errorIf(
                flowState != Compiler.FlowState.Return && !(returnsType instanceof TS.InstanceType && returnsType.prototypeType == TS.Void.typeInstance),
                'Not all code paths return a value',
                this.log_return);
            environment.removeFunctionExpection();
            environment.removeContext();

            this.closure = environment.removeClosure();
            environment.removeScope();

            if (!this.cs) return false;

            environment.addElement(this.name, new TS.FunctionType(this.functionType));

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            var fun = this.createFunctionObject(environment, this.closure);

            environment.addValueToStack(fun, this.name);

            fun.closure.push(new TS.EnclosedValue(
                this.name,
                fun.getCopy()));

            yield Operation.memory(this);

            return;
        }

        createFunctionObject(environment: Memory.Environment, closure: { [name: string]: TS.Type }): TS.FunctionObject {
            var logicElement = this;

            this.enclosedValues = [];
            for (var key in closure) {
                this.enclosedValues.push(
                    new TS.EnclosedValue(
                        key,
                        environment.getFromStack(key).getValue().getCopy()));
            }

            var declarations = [];

            var fun = new TS.FunctionObject(
                new TS.FunctionClass(),
                this.declarations,
                function *(environment: Memory.Environment) {
                    for (var i = 0; i < logicElement.log_list.length; i++) {
                        yield * logicElement.log_list[i].run(environment);

                        if (environment.flowState == Memory.FlowState.Return) {
                            var value = environment.popTempValue().getValue();
                            environment.clearCurrentTempScope();
                            environment.pushTempValue(value);
                            environment.flowState = Memory.FlowState.NormalFlow;
                            return;
                        }
                        else {
                            environment.clearCurrentTempScope();
                        }
                    }

                    return new TS.Obj();
                },
                this.enclosedValues
                );

            return fun;
        }
    }
}

module E {
    export class Function extends Element {
        getJSONName() { return 'Function' }
        c_name: C.TextField
        c_arguments: C.DropList
        c_return: C.DropField
        c_list: C.DropList
        constructor(
            name = 'foo',
            args: E.Element[] = [],
            returns: E.Element = null,
            list: E.Element[] = []) {
            super();
            this.c_name = new C.TextField(this, name)
            this.c_arguments = new C.DropList(this, args)
            this.c_return = new C.DropField(this, returns)
            this.c_list = new C.DropList(this, list)
            this.initialize([  // TODO: Zmienić
                [
                    this.c_name,
                    new C.Label('('),
                    this.c_arguments,
                    new C.Label('):'),
                    this.c_return,
                ],
                [
                    new C.Label('{'), ],
                [
                    this.c_list,
                ],
                [
                    new C.Label('}'),
                ]
            ], ElementType.Function);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Function(
                this.c_name.getRawData(),
                this.c_arguments.getLogicComponents(),
                this.c_return.constructCode(),
                this.c_list.getLogicComponents()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Function(
                this.c_name.getRawData(),
                this.c_arguments.getContentCopy(),
                this.c_return.getContentCopy(),
                this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
} 