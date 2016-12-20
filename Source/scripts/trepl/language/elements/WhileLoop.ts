module L {
    export class WhileLoop extends LogicElement {
        constructor(
            public log_condition: LogicElement,
            public log_list: LogicElement[]
        ) {
            super();
            log_condition.setAsInternalOperation();
        }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            environment.addScope();

            this.cs = this.log_condition.compile(environment) && this.cs;

            environment.addContext(Compiler.Context.Loop);
            this.compileBlock(environment, this.log_list);
            environment.removeContext();

            environment.removeScope();

            if (!this.cs) return false;

            this.errorIfTypeMismatch(TS.rValue(TS.Boolean.objectTypeInstance), this.log_condition.returns, this.log_condition);

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield Operation.memory(this);

            while (true) {
                yield* this.log_condition.run(environment);

                yield Operation.flow(this.log_condition);

                var condition = <TS.BaseClassObject>environment.popTempValue().getValue();
                environment.clearCurrentTempScope();

                if (!condition.rawValue)
                    break;

                environment.addScope('While loop');
                yield* WhileLoop.executeBlock(environment, this.log_list);
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
            }

            //yield Operation.flow(this);

            return;
        }
    }
}

module E {
    export class WhileLoop extends Element {
        getJSONName() { return 'WhileLoop' }
        c_condition: C.DropField
        c_list: C.DropList
        constructor(
            cond: E.Element = null,
            list: E.Element[] = []) {
            super();
            this.c_condition = new C.DropField(this, cond)
            this.c_list = new C.DropList(this, list)
            this.initialize([  // TODO: Zmienić
                [
                    new C.Label('while ('),
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
            var logic = new L.WhileLoop(
                this.c_condition.constructCode(),
                this.c_list.getLogicComponents()
            );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new WhileLoop(
                this.c_condition.getContentCopy(),
                this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
} 