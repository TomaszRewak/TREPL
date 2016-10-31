module L {
    export class FunctionCall extends LogicElement {
        constructor(
            public log_name: LogicElement,
            public log_arguments: LogicElement[]
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_name);
            this.cs = this.log_name.compile(environment) && this.cs;
            if (!this.cs) return false;

            this.errorIfNot(this.log_name.returns.varType instanceof TS.FunctionType, 'Expected function', this.log_name);
            if (!this.cs) return false;

            var fun = <TS.FunctionType> this.log_name.returns.varType;
            var funType = fun.prototypeType;

            var passedArguments: LogicElement[] = [];

            for (var i = 0; i < this.log_arguments.length; i++) {
                var argument = this.log_arguments[i];

                this.cs = argument.compile(environment) && this.cs;

                if (argument instanceof EmptyElement)
                    continue;

                if (!argument.cs) continue;

                this.errorIfTypeMismatch(funType.parameters[passedArguments.length].paramType, argument.returns, argument);

                passedArguments.push(argument);
            }

            this.errorIf(passedArguments.length != funType.parameters.length, 'Number of paramteres and number of anguments do not match');
            if (!this.cs) return false;

            this.returns = funType.returnType;

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            var passedArguments = 0;
            for (var i = this.log_arguments.length - 1; i >= 0; i--) {
                if (this.log_arguments[i] instanceof EmptyElement)
                    continue;

                yield* this.log_arguments[i].run(environment);
                passedArguments++;
            }
            yield* this.log_name.run(environment);

            var fun = <TS.FunctionObject> environment.popTempValue().getValue();

            yield Operation.flow(this);

            yield* fun.call(environment, passedArguments);

            return;
        }
    }
}

module E {
    export class FunctionCall extends Element {
        getJSONName() { return 'FunctionCall' }
        c_name: C.DropField
        c_arguments: C.DropList
        constructor(
            neme: E.Element = null,
            args: E.Element[] = []) {
            super();
            this.c_name = new C.DropField(this, neme),
            this.c_arguments = new C.DropList(this, args)
            this.initialize([
                [
                    this.c_name,
                    new C.Label('('),
                    this.c_arguments,
                    new C.Label(')'),
                ],
            ], ElementType.Function);
        }
        constructCode(): L.LogicElement {
            var logic = new L.FunctionCall(
                this.c_name.constructCode(),
                this.c_arguments.getLogicComponents()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new FunctionCall(
                this.c_name.getContentCopy(),
                this.c_arguments.getContentCopy()).copyMetadata(this);
        }
    }
} 