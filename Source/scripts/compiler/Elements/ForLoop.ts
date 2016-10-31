module L {
    export class ForLoop extends LogicElement {
        constructor(
            public log_init: LogicElement,
            public log_condition: LogicElement,
            public log_operation: LogicElement,
            public log_list: LogicElement[]
            ) {
            super();
            log_init.setAsInternalOperation();
            log_condition.setAsInternalOperation();
            log_operation.setAsInternalOperation();
        }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            environment.addScope();

            this.cs = this.log_init.compile(environment) && this.cs;
            this.cs = this.log_condition.compile(environment) && this.cs;
            this.cs = this.log_operation.compile(environment) && this.cs;

            environment.addContext(Compiler.Context.Loop);
            this.compileBlock(environment, this.log_list);
            environment.removeContext();

            environment.removeScope();

            if (!this.cs) return false;

            this.errorIfTypeMismatch(TS.rValue(TS.Boolean.objectTypeInstance), this.log_condition.returns, this.log_condition);

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.addScope('For loop');

            yield Operation.memory(this);

            yield* this.log_init.run(environment);
            yield Operation.flow(this.log_init);

            environment.clearCurrentTempScope();

            while (true) {
                yield* this.log_condition.run(environment);
                yield Operation.flow(this.log_condition);

                var condition = <TS.BaseClassObject> environment.popTempValue().getValue();
                environment.clearCurrentTempScope();

                if (!condition.rawValue)
                    break;

                environment.addScope('For loop body');
                yield* ForLoop.executeBlock(environment, this.log_list);
                var removedScope = environment.removeScope();

                if (environment.flowState == Memory.FlowState.Break) {
                    environment.flowState = Memory.FlowState.NormalFlow;
                    environment.clearCurrentTempScope();
                    break;
                }
                if (environment.flowState == Memory.FlowState.Return) {
                    break;
                }
                else {
                    environment.flowState = Memory.FlowState.NormalFlow;
                }

                yield* this.log_operation.run(environment);
                yield Operation.flow(this.log_operation);

                environment.clearCurrentTempScope();
            }

            var removedScope = environment.removeScope();

            //yield Operation.flow(this);

            return;
        }
    }
}

module E {
    export class ForLoop extends Element {
        getJSONName() { return 'ForLoop' }
        c_init: C.DropField
        c_condition: C.DropField
        c_operation: C.DropField
        c_list: C.DropList
        constructor(
            init: E.Element = null,
            cond: E.Element = null,
            oper: E.Element = null,
            list: E.Element[] = []) {
            super();
            this.c_init = new C.DropField(this, init)
            this.c_condition = new C.DropField(this, cond)
            this.c_operation = new C.DropField(this, oper)
            this.c_list = new C.DropList(this, list)
            this.initialize([  // TODO: Zmienić
                [
                    new C.Label('for ('),
                    this.c_init,
                    new C.Label('; '),
                    this.c_condition,
                    new C.Label('; '),
                    this.c_operation,
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
            var logic = new L.ForLoop(
                this.c_init.constructCode(),
                this.c_condition.constructCode(),
                this.c_operation.constructCode(),
                this.c_list.getLogicComponents()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new ForLoop(
                this.c_init.getContentCopy(),
                this.c_condition.getContentCopy(),
                this.c_operation.getContentCopy(),
                this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
} 