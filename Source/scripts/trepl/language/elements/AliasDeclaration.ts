module L {
    export class AliasDeclaration extends IDeclaration {
        constructor(
            public name: string,
            public log_type: LogicElement
            ) { super(name); }

        expectsType: TS.StaticResult;
        _compile(environment: Compiler.TypeEnvironment) {
            this.errorIfEmpty(this.log_type);
            this.cs = this.log_type.compile(environment) && this.cs;
            if (!this.cs) false;

            var varType = this.log_type.returns.varType;
            this.errorIfNot(varType instanceof TS.PrototypeType, 'Expected type definition', this.log_type);
            if (!this.cs) return false;

            var declarationClass = <TS.PrototypeType> varType;
            environment.addElement(this.name, declarationClass);
            this.expectsType = new TS.LValueOfType(declarationClass.declaresType());

            return this.cs;
        }

        *createTempValue(environment: Memory.Environment): IterableIterator<Operation> {
            throw 'Alias has to be assigned to some value and has none default value';
        }

        *instantiate(environment: Memory.Environment): IterableIterator<Operation> {
            environment.addAliasToStack(environment.popTempValue(), this.name);

            return;
        }
    }
}