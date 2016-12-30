module L {
    export class RawData extends LogicElement {
        constructor(
            public rawData: any
            ) { super(); }

        observer: E.RawData;

        _compile(environment: Compiler.TypeEnvironment) {
            var value: string = this.rawData;
            var numberValue: number = parseInt(this.rawData);

            if (!isNaN(numberValue)) {
                this.observer.isNumber(true);
                this.returns = new TS.RValueOfType(new TS.ClassObjectType(TS.Int.typeInstance));
            }
            else {
                this.observer.isNumber(false);
                var typeField = environment.getElement(value);

                this.errorIf(!typeField, 'No field of that name was found in this scope');
                if (!this.cs) return false;

                this.returns = new TS.LValueOfType(typeField.typ);
            }

            return this.cs;
        }

        *execute(environment: Memory.Environment): IterableIterator<Operation> {
            var rawData = <string> this.rawData;
            var value: number = parseInt(this.rawData);

            if (!isNaN(value)) {
                environment.pushTempValue(TS.Int.classInstance.getObjectOfValue(value));
            }
            else {
                var stackField = environment.getFromStack(rawData);
                environment.pushTempAlias(stackField);
            }

            yield Operation.tempMemory(this);

            return;
        }
    }
} 

module E {
    export class RawData extends Element {
        getJSONName() { return 'RawData' }
        c_data: C.TextField;
        constructor(value: string = 'foo') {
            super();
            this.c_data = new C.TextField(this, value);
            this.initialize([
                [this.c_data]
            ], ElementType.Value);
            this._isNumber = true;
        }
        constructCode(): L.LogicElement {
            var logic = new L.RawData(
                this.c_data.getRawData()
                );
            logic.setObserver(this);
            return logic;
        }
        getCopy(): Element {
            return new RawData(this.c_data.getRawData()).copyMetadata(this);
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