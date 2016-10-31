module L {
    export class Operator1 extends LogicElement {
        constructor(
            private operation: string, // string reprasenting given operation, like -, + etc.
            public log_operand: LogicElement,
            private hadSideEffects: boolean
            ) {
            super();
            this.logicFunction =
            new L.FunctionCall(
                new L.Path(this.log_operand, this.operation).setAsInternalOperation(),
                []
                ).setAsInternalOperation();
        }

        logicFunction: LogicElement;

        _compile(environment: Compiler.TypeEnvironment): boolean {
            this.cs = this.logicFunction.compile(environment) && this.cs;
            this.errorIfEmpty(this.log_operand);
            if (this.log_operand.cs)
                this.errorIfNot(this.cs, 'These two values cannot be aplied to this operator');
            if (!this.cs) return false;

            this.returns = this.logicFunction.returns;

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            yield* this.logicFunction.run(environment);

            environment.passTempValue();

            if (this.hadSideEffects)
                yield Operation.memory(this);
            else
                yield Operation.tempMemory(this);

            return;
        }
    }
}

module E {
    abstract class Operator1 extends Element {
        c_operand: C.DropField
        elemType; // class of descent of this class, which defines new operator
        operator: string;
        private hadSideEffects;
        constructor(elemType, operator: string, post: boolean, left: E.Element = null, sideEffects: boolean = false) {
            super();
            this.c_operand = new C.DropField(this, left),
            this.initialize(
                post ?
                    [[this.c_operand, new C.Label(operator)]] :
                    [[new C.Label(operator), this.c_operand]]
                , ElementType.Math);
            this.elemType = elemType;
            this.operator = post ? '_' + operator : operator;
            this.hadSideEffects = sideEffects;
        }
        constructCode(): L.LogicElement {
            var logic = new L.Operator1(
                this.operator,
                this.c_operand.constructCode(),
                this.hadSideEffects
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new this.elemType(
                this.c_operand.getContentCopy()).copyMetadata(this);
        }
    }

    /////////////// Operators ////////////////////

    export class Increment extends Operator1 {
        getJSONName() { return 'Increment' }
        constructor(a: E.Element = null) {
            super(Increment, '++', false, a, true);
        }
    }

    export class Decrement extends Operator1 {
        getJSONName() { return 'Decrement' }
        constructor(a: E.Element = null) {
            super(Decrement, '--', false, a, true);
        }
    }

    export class PostIncrement extends Operator1 {
        getJSONName() { return 'PostIncrement' }
        constructor(a: E.Element = null) {
            super(PostIncrement, '++', true, a, true);
        }
    }

    export class PostDecrement extends Operator1 {
        getJSONName() { return 'PostDecrement' }
        constructor(a: E.Element = null) {
            super(PostDecrement, '--', true, a, true);
        }
    }

    export class Print extends Operator1 {
        getJSONName() { return 'Print' }
        constructor(a: E.Element = null) {
            super(Print, 'print', false, a, true);
        }
    }

    export class Scan extends Operator1 {
        getJSONName() { return 'Scan' }
        constructor(a: E.Element = null) {
            super(Scan, 'scan', false, a, true);
        }
    }

    export class Not extends Operator1 {
        getJSONName() { return 'Not' }
        constructor(a: E.Element = null) {
            super(Not, '!', false, a);
        }
    }
}