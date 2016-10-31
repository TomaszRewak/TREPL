module L {
    export class StringLiteral extends LogicElement {
        constructor(
            public rawData: any
            ) { super(); }

        observer: E.RawData;

        _compile(environment: Compiler.TypeEnvironment) {
            var value: string = this.rawData;

            this.observer.isNumber(true);
            this.returns = new TS.RValueOfType(new TS.ClassObjectType(TS.String.typeInstance));

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            var rawData = <string> this.rawData;

            environment.pushTempValue(TS.String.classInstance.getObjectOfValue(rawData));

            yield Operation.tempMemory(this);

            return;
        }
    }
} 

module E {
    export class StringLiteral extends Element {
        getJSONName() { return 'StringLiteral' }
        c_data: C.TextField;
        constructor(value: string = 'foo') {
            super();
            this.c_data = new C.TextField(this, value);
            this.initialize([
                [new C.Label('"'), this.c_data, new C.Label('"')]
            ], ElementType.Value);
            this._isNumber = true;
        }
        constructCode(): L.LogicElement {
            var logic = new L.StringLiteral(
                this.c_data.getRawData()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new StringLiteral(this.c_data.getRawData()).copyMetadata(this);
        }
        private _isNumber;
        isNumber(num: boolean) {
            if (num != this._isNumber) {
                this._isNumber = num;

                this.clearStyles();
                this.setStyle(num ? ElementType.Value : ElementType.Variable);
            }
        }
    }
}