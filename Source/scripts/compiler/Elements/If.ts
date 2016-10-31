module L {
    export class If extends LogicElement {
        constructor(
            public log_condition: LogicElement,
            public log_list: LogicElement[]
            ) {
            super();
            log_condition.setAsInternalOperation();
        }

        _compile(environment: Compiler.TypeEnvironment) {
            this.errorIfEmpty(this.log_condition);

            environment.addScope();

            this.cs = this.log_condition.compile(environment) && this.cs;
            this.compileBlock(environment, this.log_list);

            environment.removeScope();

            if (!this.cs) return false;

            this.errorIfTypeMismatch(TS.rValue(TS.Boolean.objectTypeInstance), this.log_condition.returns, this.log_condition);
            
            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_condition.run(environment);

            yield Operation.flow(this.log_condition);

            var condition = <TS.BaseClassObject> environment.popTempValue().getValue();

            if (condition.rawValue) {
                environment.addScope('If body');

                yield Operation.memory(this);
                
                yield* If.executeBlock(environment, this.log_list);

                var removedScope = environment.removeScope();

                yield Operation.memory(this);
            }

            return;
        }
    }
}

module E {
    export class If extends Element {
        getJSONName() { return 'If' }
        c_condition: C.DropField
        c_list: C.DropList
        constructor(
            cond: E.Element = null,
            list: E.Element[] = []) {
            super();
            this.c_condition = new C.DropField(this, cond)
            this.c_list = new C.DropList(this, list)
            this.initialize([
                [
                    new C.Label('if ('),
                    this.c_condition,
                    new C.Label(')'),
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
            ],
                ElementType.Flow);
        }
        constructCode(): L.LogicElement {
            var logic = new L.If(
                this.c_condition.constructCode(),
                this.c_list.getLogicComponents()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new If(
                this.c_condition.getContentCopy(),
                this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
} 