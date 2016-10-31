module L {
    export class Programm extends LogicElement {
        constructor(
            public log_list: LogicElement[]
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.compileBlock(environment, this.log_list);

            return this.cs;
        }

        *run(environment: Memory.Environment): IterableIterator<Operation> {
            yield* L.LogicElement.prototype.run.call(this, environment);

            environment.clearCurrentTempScope();

            return;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.flowState = Memory.FlowState.NormalFlow;

            yield* Programm.executeBlock(environment, this.log_list);

            return;
        }
    }
}

module E {
    class ProgramParent implements ElementParent {
        constructor(private element: Program) {
        }
        detachElement() {
        }
        attachElement(element: E.Element) { }
        containsElement() {
            return true;
        }
        edited() {
            try {
                var programm = this.element.constructCode();
                programm.compile(new Compiler.TypeEnvironment());
            }
            catch(any) {
            }
        }
    }

    export class Program extends Element {
        getJSONName() { return 'Program' }
        c_list: C.DropList;
        constructor(list: E.Element[] = []) {
            super();
            this.c_list = new C.DropList(this, list);
            this.initialize([
                [new C.Label('|>')],
                [this.c_list],
                [new C.Label('')],
            ], ElementType.Program);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Programm(
                this.c_list.getLogicComponents()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Program(this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
} 