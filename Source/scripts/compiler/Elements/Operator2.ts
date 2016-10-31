module L {
    export class Operator2 extends LogicElement {
        constructor(
            private operation: string, // string reprasenting given operation, like -, + etc.
            public log_left: LogicElement,
            public log_right: LogicElement
            ) {
            super();
            this.logicFunction =
                new L.FunctionCall(
                    new L.Path(this.log_left, this.operation).setAsInternalOperation(),
                    [this.log_right]
                ).setAsInternalOperation();
        }

        logicFunction: LogicElement;

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.cs = this.logicFunction.compile(environment) && this.cs;
            this.errorIfEmpty(this.log_left);
            this.errorIfEmpty(this.log_right);
            if (this.log_left.cs && this.log_right.cs)
                this.errorIfNot(this.cs, 'These two values cannot be aplied to this operator');
            if (!this.cs) return false;

            this.returns = this.logicFunction.returns;

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.logicFunction.run(environment);

            environment.passTempValue();

            yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    abstract class Operator2 extends Element {
        c_left: C.DropField
        c_right: C.DropField
        elemType; // class of descent of this class, which defines new operator
        operator: string;
        constructor(elemType, operator: string, left: E.Element = null, right: E.Element = null) {
            super();
            this.c_left = new C.DropField(this, left),
            this.c_right = new C.DropField(this, right)
            this.initialize([  // TODO: Zmienić
                [
                    this.c_left,
                    new C.Label(operator),
                    this.c_right
                ]
            ], ElementType.Math);
            this.elemType = elemType;
            this.operator = operator;
        }
        constructCode(): L.LogicElement {
            var logic = new L.Operator2(
                this.operator,
                this.c_left.constructCode(),
                this.c_right.constructCode()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new this.elemType(
                this.c_left.getContentCopy(),
                this.c_right.getContentCopy()).copyMetadata(this);
        }
    }

    /////////////// Operators ////////////////////

    export class Add extends Operator2 {
        getJSONName() { return 'Add' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(Add, '+', a, b);
        }
    }

    export class Substract extends Operator2 {
        getJSONName() { return 'Substract' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(Substract, '-', a, b);
        }
    }

    export class Multiply extends Operator2 {
        getJSONName() { return 'Multiply' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(Multiply, '*', a, b);
        }
    }

    export class Divide extends Operator2 {
        getJSONName() { return 'Divide' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(Divide, '/', a, b);
        }
    }

    export class Equal extends Operator2 {
        getJSONName() { return 'Equal' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(Equal, '==', a, b);
        }
    }

    export class NotEqual extends Operator2 {
        getJSONName() { return 'NotEqual' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(NotEqual, '!=', a, b);
        }
    }

    export class Less extends Operator2 {
        getJSONName() { return 'Less' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(Less, '<', a, b);
        }
    }

    export class LessEqual extends Operator2 {
        getJSONName() { return 'LessEqual' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(LessEqual, '<=', a, b);
        }
    }

    export class More extends Operator2 {
        getJSONName() { return 'More' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(More, '>', a, b);
        }
    }

    export class MoreEqual extends Operator2 {
        getJSONName() { return 'MoreEqual' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(MoreEqual, '>=', a, b);
        }
    }

    export class Modulo extends Operator2 {
        getJSONName() { return 'Modulo' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(Modulo, '%', a, b);
        }
    }

    export class And extends Operator2 {
        getJSONName() { return 'And' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(And, '&&', a, b);
        }
    }

    export class Or extends Operator2 {
        getJSONName() { return 'Or' }
        constructor(a: E.Element = null, b: E.Element = null) {
            super(Or, '||', a, b);
        }
    }
}