module L {
    export class NewHeapObject extends LogicElement {
        constructor(
            public log_type: LogicElement,
            public log_arguments: LogicElement[]
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_type);
            this.cs = this.log_type.compile(environment) && this.cs;

            var passedValues: LogicElement[] = [];

            for (var i = 0; i < this.log_arguments.length; i++) {
                this.cs = this.log_arguments[i].compile(environment) && this.cs;

                if (this.log_arguments[i] instanceof EmptyElement)
                    continue;

                passedValues.push(this.log_arguments[i]);
            }

            this.errorIf(passedValues.length > 0, 'Argumnets for constructor are not supported yet');
            if (!this.cs) return false;

            this.errorIfNot(this.log_type.returns.varType instanceof TS.PrototypeType, 'Class definition expectad', this.log_type);
            if (!this.cs) return false;

            var classType = <TS.PrototypeType> this.log_type.returns.varType;
            this.returns = new TS.RValueOfType(new TS.ReferenceType(new TS.ReferenceClassType(classType)));

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_type.run(environment);

            var classType = <TS.Prototype> environment.popTempValue().getValue();
            var classObject = <TS.ClassObject> classType.defaultValue();
            yield* classObject.construct(environment);

            var onHeapElement = environment.addToHeap(classObject);
            environment.pushTempValue(new TS.Reference(new TS.ReferenceClass(classType), onHeapElement));

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class NewHeapObject extends Element {
        getJSONName() { return 'NewHeapObject' }
        c_type: C.DropField
        c_arguments: C.DropList
        constructor(
            typ: E.Element = null,
            args: E.Element[] = []) {
            super();
            this.c_type = new C.DropField(this, typ),
            this.c_arguments = new C.DropList(this, args)
            this.initialize([
                [
                    new C.Label('new'),
                    this.c_type,
                    new C.Label('('),
                    this.c_arguments,
                    new C.Label(')'),
                ],
            ], ElementType.Value);
        }
        constructCode(): L.LogicElement {
            var logic = new L.NewHeapObject(
                this.c_type.constructCode(),
                this.c_arguments.getLogicComponents()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new NewHeapObject(
                this.c_type.getContentCopy(),
                this.c_arguments.getContentCopy()).copyMetadata(this);
        }
    }
} 