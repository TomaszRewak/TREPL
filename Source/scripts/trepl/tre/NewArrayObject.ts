import * as Lang from '../language'

export class NewArrayObject extends Lang.Logic.LogicElement {
        constructor(
            public log_type: Lang.Logic.LogicElement,
            public log_size: Lang.Logic.LogicElement
            ) {
            super();
        }

        _compile(environment: Lang.Compiler.TypeEnvironment): boolean {
            this.errorIfEmpty(this.log_type);
            this.errorIfEmpty(this.log_size);
            this.cs = this.log_type.compile(environment) && this.cs;
            this.cs = this.log_size.compile(environment) && this.cs;

            if (!this.cs) return false;

            this.errorIfNotInstance(this.log_size.returnsType(), this.log_size);
            this.errorIfNotPrototype(this.log_type.returnsType(), this.log_type);
            if (!this.cs) return false;

			var prototype = <Lang.TypeSystem.PrototypeType>this.log_type.returnsType();

			var arrayType = new Lang.TypeSystem.ArrayClassType(prototype);

			this.returns = new Lang.TypeSystem.RValue(new Lang.TypeSystem.ReferenceType(new Lang.TypeSystem.ReferenceClassType(arrayType)));

            return this.cs;
        }

		*execute(environment: Lang.Environment.Environment): IterableIterator<Lang.Flow.Operation> {
            yield* this.log_size.run(environment);
            yield* this.log_type.run(environment);

			var elemType = <Lang.TypeSystem.PrototypeObj>environment.popFromTempStack().getValue();
			var length: number = (<Lang.TypeSystem.BaseClassInstanceObj>environment.popFromTempStack().getValue()).rawValue;

			var arrayClass = new Lang.TypeSystem.ArrayClassObj(elemType, length);
			var object = <Lang.TypeSystem.ArrayObj>arrayClass.defaultValue();

            yield* object.construct(environment);

			var heapField = environment.addToHeap(object);
			environment.addOnTempStack(new Lang.TypeSystem.ReferenceObj(heapField));

            return;
        }
    }