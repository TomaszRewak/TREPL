module L {
    export class Path extends LogicElement {
        constructor(
            public log_left: LogicElement,
            public name: string
            ) { super(); }

        _compile(environment: Compiler.TypeEnvironment) {
            this.errorIfEmpty(this.log_left);
            this.cs = this.log_left.compile(environment) && this.cs;
            if (!this.cs) return false;

            this.errorIfNotInstance(this.log_left.returns.varType, this.log_left);
            if (!this.cs) return false;

            var leftType = <TS.InstanceType> this.log_left.returns.varType;
            while (leftType instanceof TS.ReferenceType && !leftType.hasMethod(this.name))
                leftType = (<TS.ReferenceType> leftType).prototypeType.referencedPrototypeType.declaresType();

            this.innerContext = leftType;

            var leftPrototype = leftType.prototypeType;

            if (leftPrototype instanceof TS.ClassType) {
                this.errorIfNot(leftPrototype.hasField(this.name) || leftPrototype.hasMethod(this.name), 'None field nor method of this name was found');
                if (!this.cs) return false;

                if (leftPrototype.hasField(this.name))
                    this.returns = new TS.LValueOfType(leftPrototype.fields[this.name].typ);
                else
                    this.returns = new TS.RValueOfType(leftPrototype.functions[this.name].declaresType());
            }
            else {
                this.errorIfNot(leftPrototype.hasMethod(this.name), 'None method for this name was found');
                if (!this.cs) return false;
                this.returns = new TS.RValueOfType(leftPrototype.functions[this.name].declaresType());
            }

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.log_left.run(environment);

            var isAlias = environment.isTempValueAlias();
            var thisMemoryField = environment.popTempValue();
            while (thisMemoryField.getValue() instanceof TS.Reference && !(<TS.Instance> thisMemoryField.getValue()).hasMethod(this.name)) {
                var reference = (<TS.Reference> thisMemoryField.getValue()).reference;
                if (!reference) throw 'Null reference exception';
                thisMemoryField = reference;
                isAlias = true;
            }
            var valueLeft = <TS.Instance> thisMemoryField.getValue();

            if (valueLeft instanceof TS.ClassObject) {
                if (valueLeft.hasFieldValue(this.name)) {
                    var customTypeField = valueLeft.getFieldValue(this.name);
                    environment.pushTempAlias(customTypeField);
                }
                else if (valueLeft.hasMethod(this.name)) {
                    var method = valueLeft.getMethod(thisMemoryField, this.name, isAlias);
                    environment.pushTempValue(method);
                }
                else {
                    throw 'No such field or method was for this object';
                }
            }
            else {
                if (valueLeft.hasMethod(this.name)) {
                    var method = valueLeft.getMethod(thisMemoryField, this.name, isAlias);
                    environment.pushTempValue(method);
                }
                else {
                    throw 'No such field or method was for this object';
                }
            }

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    export class Path extends Element {
        getJSONName() { return 'Path' }
        c_left: C.DropField
        c_right: C.PenetratingTextField
        constructor(element: E.Element = null, name = 'foo') {
            super();
            this.c_left = new C.DropField(this, element)
            this.c_right = new C.PenetratingTextField(this, name)
            this.initialize([
                [this.c_left, new C.Label('.'), this.c_right]
            ], ElementType.Type);
        }
        constructCode(): L.LogicElement {
            var logic = new L.Path(
                this.c_left.constructCode(),
                this.c_right.getRawData()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new Path(
                this.c_left.getContentCopy(),
                this.c_right.getRawData()).copyMetadata(this);
        }
    }
} 