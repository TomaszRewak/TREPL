module L {
    export class NewObject extends LogicElement {
        constructor(
            public log_type: LogicElement,
            public log_arguments: LogicElement[]
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.error('This element is not supported yet');
            if (!this.cs) return false;

            this.log_type.compile(environment);
            for (var i = 0; i < this.log_arguments.length; i++)
                this.log_arguments[i].compile(environment);

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_type.run(environment);

            var classType = <TS.Prototype> environment.popTempValue().getValue();

            throw "Impelement this";
            //var values: { [name: string]: TS.Object } = {};
            //for (var i = 0; i < classType.fields.length; i++) {
            //    var field = classType.fields[i];
            //    if (field.defaultValue) {
            //        yield* field.defaultValue.value.run(environment);
            //        values[field.name] = environment.popTempValue().getValue().getCopy();
            //    }
            //    else {
            //        values[field.name] = field.paramType.getDefaultValue();
            //    }
            //}
            //var object = classType.getObjectOfValue(values);
            //environment.pushTempValue(object);
        }
    }
}

module E {
    export class NewObject extends Element {
        getJSONName() { return 'NewObject' }
        c_type: C.DropField
        c_arguments: C.DropList
        constructor(
            typ: E.Element = null,
            argumets: E.Element[] = []) {
            super();
            this.c_type = new C.DropField(this, typ),
            this.c_arguments = new C.DropList(this, argumets)
            this.initialize([
                [
                    new C.Label('val'),
                    this.c_type,
                    new C.Label('('),
                    this.c_arguments,
                    new C.Label(')'),
                ],
            ], ElementType.Value);
        }
        constructCode(): L.LogicElement {
            var logic = new L.NewObject(
                this.c_type.constructCode(),
                this.c_arguments.getLogicComponents()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new NewObject(
                this.c_type.getContentCopy(),
                this.c_arguments.getContentCopy()).copyMetadata(this);
        }
    }
} 