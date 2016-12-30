module L {
    export class NewArrayObject extends LogicElement {
        constructor(
            public log_type: LogicElement,
            public log_size: LogicElement
            ) {
            super();
        }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_type);
            this.errorIfEmpty(this.log_size);
            this.cs = this.log_type.compile(environment) && this.cs;
            this.cs = this.log_size.compile(environment) && this.cs;

            if (!this.cs) return false;

            this.errorIfNotInstance(this.log_size.returnsType(), this.log_size);
            this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
            if (!this.cs) return false;

            var prototype = <TS.PrototypeType> this.log_type.returnsType();

            var arrayType = new TS.ArrayClassType(prototype);

            this.returns = new TS.RValueOfType(new TS.ReferenceType(new TS.ReferenceClassType(arrayType)));

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_size.run(environment);
            yield* this.log_type.run(environment);

            var elemType = <TS.Prototype> environment.popTempValue().getValue();
            var length: number = (<TS.BaseClassObject> environment.popTempValue().getValue()).rawValue;
            
            var arrayClass = new TS.ArrayClass(elemType, length);
            var object = <TS.ArrayObject> arrayClass.defaultValue();

            yield* object.construct(environment);

            var heapField = environment.addToHeap(object);
            environment.pushTempValue(new TS.Reference(new TS.ReferenceClass(arrayClass), heapField));

            return;
        }
    }
} 

module E {
    export class NewArray extends Element { // Add implementation
        getJSONName() { return 'NewArray' }
        c_type: C.DropField
        c_size: C.DropField
        constructor(
            typ: E.Element = null,
            size: E.Element = null) {
            super();
            this.c_type = new C.DropField(this, typ),
            this.c_size = new C.DropField(this, size);
            this.initialize([
                [
                    new C.Label('new'),
                    this.c_type,
                    new C.Label('['),
                    this.c_size,
                    new C.Label(']'),
                ],
            ], ElementType.Value);
        }
        constructCode(): L.LogicElement {
            var logic = new L.NewArrayObject(
                this.c_type.constructCode(),
                this.c_size.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new NewArray(
                this.c_type.getContentCopy(),
                this.c_size.getContentCopy()).copyMetadata(this);
        }
    }
}