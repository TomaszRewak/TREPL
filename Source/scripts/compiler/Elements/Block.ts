module L {
    export class Block extends LogicElement {
        constructor(
            public log_list: LogicElement[]
        ) {
            super();
        }

        _compile(environment: Compiler.TypeEnvironment) {
            environment.addScope();

            this.compileBlock(environment, this.log_list);

            environment.removeScope();

            if (!this.cs) return false;

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            environment.addScope('Block');

            yield Operation.memory(this);

            yield* If.executeBlock(environment, this.log_list);

            var removedScope = environment.removeScope();

            yield Operation.memory(this);

            return;
        }
    }
}

module E {
    export class Block extends Element {
        getJSONName() { return 'Block' }
        c_list: C.DropList
        constructor(
            list: E.Element[] = []) {
            super();
            this.c_list = new C.DropList(this, list)
            this.initialize([
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
            var logic = new L.Block(
                this.c_list.getLogicComponents()
            );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Block(
                this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
} 