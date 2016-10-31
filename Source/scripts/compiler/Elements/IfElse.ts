module L {
    export class IfElse extends LogicElement {
        constructor(
            public log_condition: LogicElement,
            public log_listTrue: LogicElement[],
            public log_listFalse: LogicElement[]
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_condition);

            environment.addScope();

            this.cs = this.log_condition.compile(environment) && this.cs;

            environment.addScope();
            var flowState1 = this.compileBlock(environment, this.log_listTrue);
            environment.removeScope();
            environment.addScope();
            var flowState2 = this.compileBlock(environment, this.log_listFalse);
            environment.removeScope();

            this.flowState = Math.min(flowState1, flowState2);

            environment.removeScope();

            if (!this.cs) return false;

            this.errorIfTypeMismatch(TS.rValue(TS.Boolean.objectTypeInstance), this.log_condition.returns, this.log_condition);

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_condition.run(environment);
            var condition = <TS.BaseClassObject> environment.popTempValue().getValue();

            yield Operation.flow(this);

            if (condition.rawValue) {
                environment.addScope('If body');

                yield     Operation.memory(this);

                yield* IfElse.executeBlock(environment, this.log_listTrue);

                var removedScope = environment.removeScope();

                yield     Operation.memory(this);
            }
            else {
                environment.addScope('Else body');

                yield     Operation.memory(this);

                yield* IfElse.executeBlock(environment, this.log_listFalse);

                var removedScope = environment.removeScope();

                yield     Operation.memory(this);
            }

            return;
        }
    }
}

module E {
    export class IfElse extends Element {
        getJSONName() { return 'IfElse' }
        c_condition: C.DropField
        c_listTrue: C.DropList
        c_listFalse: C.DropList
        constructor(
            cond: E.Element = null,
            listTrue: E.Element[] = [],
            listFalse: E.Element[] = []) {
            super();
            this.c_condition = new C.DropField(this, cond)
            this.c_listTrue = new C.DropList(this, listTrue)
            this.c_listFalse = new C.DropList(this, listFalse)
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
                    this.c_listTrue,
                ],
                [
                    new C.Label('}'),
                ],
                [
                    new C.Label('else'),
                ],
                [
                    new C.Label('{'),
                ],
                [
                    this.c_listFalse,
                ],
                [
                    new C.Label('}'),
                ]
            ],
                ElementType.Flow);
        }
        constructCode(): L.LogicElement {
            var logic = new L.IfElse(
                this.c_condition.constructCode(),
                this.c_listTrue.getLogicComponents(),
                this.c_listFalse.getLogicComponents()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new IfElse(
                this.c_condition.getContentCopy(),
                this.c_listTrue.getContentCopy(),
                this.c_listFalse.getContentCopy()).copyMetadata(this);
        }
    }
}