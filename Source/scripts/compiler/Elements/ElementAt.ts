module L {
    export class ElementAt extends LogicElement {
        constructor(
            public log_array: LogicElement,
            public log_index: LogicElement
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_array);
            this.errorIfEmpty(this.log_index);
            this.cs = this.log_array.compile(environment) && this.cs;
            this.cs = this.log_index.compile(environment) && this.cs;

            if (!this.cs) return false;

            this.errorIfNotInstance(this.log_index.returnsType(), this.log_index);
            if (!this.cs) return false;

            var leftType = this.log_array.returnsType();
            while (leftType instanceof TS.ReferenceType)
                leftType = (<TS.ReferenceType> leftType).prototypeType.referencedPrototypeType.declaresType();
            
            var arrayInstance = <TS.InstanceType> leftType;
            var indexInstance = <TS.InstanceType> this.log_index.returnsType();

            this.errorIfNot(arrayInstance instanceof TS.ArrayType, 'Expected array', this.log_array);
            if (!this.cs) return false;

            var arrayType = (<TS.ArrayType> arrayInstance).prototypeType;

            this.returns = new TS.LValueOfType(arrayType.elementsClass.declaresType());

            return true;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_index.run(environment);
            yield* this.log_array.run(environment);

            var tempMemoryField = environment.popTempValue();
            var index: number = (<TS.BaseClassObject> environment.popTempValue().getValue()).rawValue;

            while (tempMemoryField.getValue() instanceof TS.Reference)
                tempMemoryField = (<TS.Reference> tempMemoryField.getValue()).reference;
            var leftObject = tempMemoryField.getValue();

            var object = <TS.ArrayObject> leftObject;

            var arrayField = object.getField(index);
            environment.pushTempAlias(arrayField);

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class ElementAt extends Element { // Add implementation
        getJSONName() { return 'ElementAt' }
        c_array: C.DropField
        c_index: C.DropField
        constructor(
            array: E.Element = null,
            index: E.Element = null) {
            super();
            this.c_array = new C.DropField(this, array),
            this.c_index = new C.DropField(this, index),
            this.initialize([
                [
                    this.c_array,
                    new C.Label('['),
                    this.c_index,
                    new C.Label(']'),
                ],
            ], ElementType.Value);
        }
        constructCode(): L.LogicElement {
            var logic = new L.ElementAt(
                this.c_array.constructCode(),
                this.c_index.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new ElementAt(
                this.c_array.getContentCopy(),
                this.c_index.getContentCopy()).copyMetadata(this);
        }
    }
} 