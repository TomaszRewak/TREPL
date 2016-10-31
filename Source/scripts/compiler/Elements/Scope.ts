module L {
    export class Scope extends LogicElement {
        constructor(
            public log_list: LogicElement[]
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            for (var i = 0; i < this.log_list.length; i++)
                this.cs = this.log_list[i].compile(environment) && this.cs;

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {

            environment.addScope('Scope');

            yield Operation.memory(this);

            for (var i = 0; i < this.log_list.length; i++)
                yield* this.log_list[i].run(environment);

            environment.removeScope();

            yield Operation.memory(this);

            return;
        }
    }
}

module E {
    export class Scope extends Element {
        getJSONName() { return 'Scope' }
        c_list: C.DropList
        constructor(elements: E.Element[] = []) {
            super();
            this.c_list = new C.DropList(this, elements)
            this.initialize([
                [new C.Label('{')],
                [this.c_list],
                [new C.Label('}')]
            ], ElementType.Flow);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Scope(
                this.c_list.getLogicComponents()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Scope(
                this.c_list.getContentCopy()).copyMetadata(this);
        }
    }
} 