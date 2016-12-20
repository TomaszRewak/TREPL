module MenuInflater {

    export class Helper {
        constructor(
            public shortcut: string,
            public element: E.Element,
            public example: E.Element,
            public name: string,
            public description: string) { }
    }

    function inflate(container: JQuery, elements: Helper[], menu: Menu.Menu) {
        elements.forEach((value) => {
            var helper = $('<div></div>');
            helper.addClass('helper');

            var description = $('<div></div>');
            description.addClass('helperDescription');
            helper.append(description);

            var name = $('<div></div>');
            name.text(value.name);
            description.append(name);

            var questionMark = $('<span class="glyphicon glyphicon glyphicon-question-sign" aria-hidden="true"></span>');
            questionMark.addClass('helperMore');
            description.append(questionMark);

            var helperHolder = $('<div></div>');
            helperHolder.append(value.element.getCopy().getElement());
            helperHolder.addClass('helperHolder');
            helper.append(helperHolder);

            description.click(() => { 
                menu.gotoElementPreviw(value);
            });

            container.append(helper);
        });
    }

    export function inflateWithValueHelpers(container: JQuery, menu: Menu.Menu) {
        inflate(container, valueHelpers, menu);
    }

    export function inflateWithFlowHelpers(container: JQuery, menu: Menu.Menu) {
        inflate(container, flowHelpers, menu);
    }

    export function inflateWithVariableHelpers(container: JQuery, menu: Menu.Menu) {
        inflate(container, variableHelpers, menu);
    }

    export function inflateWithMathHelpers(container: JQuery, menu: Menu.Menu) {
        inflate(container, mathHelpers, menu);
    }

    export function inflateWithFunctionHelpers(container: JQuery, menu: Menu.Menu) {
        inflate(container, functionHelpers, menu);
    }

    export function inflateWithClassHelpers(container: JQuery, menu: Menu.Menu) {
        inflate(container, typeHelpers, menu);
    }

    export function inflateWithOtherHelpers(container: JQuery, menu: Menu.Menu) {
        inflate(container, otherHelpers, menu);
    }

    export function inflateWithAllHelpers(container: JQuery, menu: Menu.Menu) {
        inflate(container, allHelpers, menu);
    }

    var valueHelpers = [
        new Helper(
            'number',
            new E.RawData('10'),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["foo", { "element": "Int", "params": [], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }]], "visible": true }),
            'Number',
            'Returns number of provided value.'),
        new Helper(
            'true',
            new E.True,
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "If", "params": [{ "element": "True", "params": [], "visible": true }, []], "visible": true }]], "visible": true }),
            'True',
            'True boolean value.'),
        new Helper(
            'false',
            new E.False,
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "If", "params": [{ "element": "False", "params": [], "visible": true }, []], "visible": true }]], "visible": true }),
            'False',
            'False boolean value.'),
        new Helper(
            '""',
            new E.StringLiteral('Hello'),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "StringLiteral", "params": ["Hello"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["x", { "element": "FunctionCall", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "length"], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }),
            'String',
            'String literal.'),
        new Helper(
            'null',
            new E.Null,
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Class", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }]], "visible": true }, { "element": "ReferenceDefinition", "params": ["x", { "element": "RawData", "params": ["Class"], "visible": true }, { "element": "NewHeapObject", "params": [{ "element": "RawData", "params": ["Class"], "visible": true }, []], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["x"], "visible": true }, { "element": "Null", "params": [], "visible": true }], "visible": true }]], "visible": true }),
            'Null',
            'Null reference value.'),
        new Helper(
            'new',
            new E.NewHeapObject,
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Class", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }]], "visible": true }, { "element": "ReferenceDefinition", "params": ["foo", { "element": "RawData", "params": ["Class"], "visible": true }, { "element": "NewHeapObject", "params": [{ "element": "RawData", "params": ["Class"], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }),
            'New heap object',
            'Creates a new object of provided type and places it on the heap.'),
        new Helper(
            'new []',
            new E.NewArray,
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "NewArray", "params": [{ "element": "Int", "params": [], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'New heap array',
            'Creates a new array composed of probided type and places it on the heap.'),
        new Helper(
            'ref of',
            new E.ReferenceOf,
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }, { "element": "ReferenceDefinition", "params": ["bar", { "element": "Int", "params": [], "visible": true }, { "element": "ReferenceOf", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Reference of',
            'Returns a new reference to the provided object.'),
        new Helper(
            'val of',
            new E.ValueOf,
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["1"], "visible": true }], "visible": true }, { "element": "ReferenceDefinition", "params": ["b", { "element": "Int", "params": [], "visible": true }, { "element": "ReferenceOf", "params": [{ "element": "RawData", "params": ["a"], "visible": true }], "visible": true }], "visible": true }, { "element": "VariableDefinition", "params": ["c", { "element": "Ref", "params": [{ "element": "Ref", "params": [{ "element": "Int", "params": [], "visible": true }], "visible": true }], "visible": true }, { "element": "ReferenceOf", "params": [{ "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "ValueOf", "params": [{ "element": "ValueOf", "params": [{ "element": "RawData", "params": ["c"], "visible": true }], "visible": true }], "visible": true }, { "element": "RawData", "params": ["9"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["d", { "element": "ValueOf", "params": [{ "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Value of',
            'Returns a value referenced by a reference.'),
        new Helper(
            'default value',
            new E.DefaultValue,
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["foo", { "element": "Int", "params": [], "visible": true }, { "element": "DefaultValue", "params": [{ "element": "Int", "params": [], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Default value',
            'Returns a new object of the provided type.'),
        new Helper(
            '[]',
            new E.ElementAt,
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDeclaration", "params": ["foo", { "element": "Array", "params": [{ "element": "Int", "params": [], "visible": true }, "5"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "ElementAt", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, { "element": "RawData", "params": ["3"], "visible": true }], "visible": true }, { "element": "RawData", "params": ["4"], "visible": true }], "visible": true }, { "element": "Print", "params": [{ "element": "ElementAt", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, { "element": "RawData", "params": ["3"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Element at',
            'Returns an element that is located under specified index in given array.'),
        new Helper(
            'random',
            new E.Random,
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "Random", "params": [], "visible": true }], "visible": true }]], "visible": true }),
            'Random',
            'Yields a random number between 0 and 100.'),
    ];

    var flowHelpers = [
        new Helper(
            'if',
            new E.If(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["4"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, [{ "element": "Print", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }),
            'If',
            'Executes given block of instruction, if specified condition is true.'),
        new Helper(
            'if else',
            new E.IfElse(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["4"], "visible": true }], "visible": true }, { "element": "IfElse", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, [{ "element": "Print", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }], "visible": true }], [{ "element": "Print", "params": [{ "element": "RawData", "params": ["6"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }),
            'If-else',
            'If specified condition is true, executes the first block of instructions, otherwise executes the second one.'),
        new Helper(
            'while',
            new E.WhileLoop(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "WhileLoop", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, [{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "Multiply", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["i"], "visible": true }], "visible": true }], "visible": true }, { "element": "Print", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }),
            'While loop',
            'Basic "while loop" with a condition block. Condition is being evaluated before every iteration and the loop continues to execute only if it\'s value is true.'),
        new Helper(
            'for',
            new E.ForLoop(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, [{ "element": "Print", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }),
            'For loop',
            'Basic "for loop" with initialize, condition and step blocks. Initialization happens only once, when the program enters the loop. Condition is being evaluated before every iteration and the loop continues to execute only if it\'s value is true. Step block is being executed after every iteration.'),
        new Helper(
            'for',
            new E.ForLoop(
                new E.VariableImplicitDefinition(
                    'i',
                    new E.RawData('0')
                    ),
                new E.Less(
                    new E.RawData('i'),
                    new E.RawData('5')
                    ),
                new E.Increment(
                    new E.RawData('i')
                    )
                ),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, [{ "element": "Print", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }),
            'For loop',
            'Pre-filled for loop.'),
        new Helper(
            '{}',
            new E.Block(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["2"], "visible": true }], "visible": true }, { "element": "Block", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["3"], "visible": true }], "visible": true }]], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["4"], "visible": true }], "visible": true }]], "visible": true }),
            'Block',
            'Block of code is being executed in a forced scope.'),
        new Helper(
            'break',
            new E.Break(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, [{ "element": "If", "params": [{ "element": "Equal", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["3"], "visible": true }], "visible": true }, [{ "element": "Break", "params": [], "visible": true }]], "visible": true }]], "visible": true }]], "visible": true }),
            'Break',
            'Breaks the execution of the current loop.'),
        new Helper(
            'continue',
            new E.Continue(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, [{ "element": "If", "params": [{ "element": "Equal", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["3"], "visible": true }], "visible": true }, [{ "element": "Continue", "params": [], "visible": true }]], "visible": true }]], "visible": true }]], "visible": true }),
            'Continue',
            'Skips to the next iteration of the current loop.'),
    ];

    var mathHelpers = [
        new Helper(
            '+',
            new E.Add(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Add',
            'Adds two values without changeing them.'),
        new Helper(
            '-',
            new E.Substract(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "Substract", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Substract',
            'Substracts two values without changeing them.'),
        new Helper(
            '*',
            new E.Multiply(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "Multiply", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Multiply',
            'Multiplies two values without changeing them.'),
        new Helper(
            '/',
            new E.Divide(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "Divide", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Divide',
            'Divides two values without changeing them.'),
        new Helper(
            '==',
            new E.Equal(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "Equal", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }),
            'Equal',
            'Checks if two values are equal.'),
        new Helper(
            '!=',
            new E.NotEqual(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "NotEqual", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }),
            'Not equal',
            'Checks if two values are not equal.'),
        new Helper(
            '<',
            new E.Less(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }),
            'Less',
            'Returns true if second value is greater.'),
        new Helper(
            '<=',
            new E.LessEqual(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "LessEqual", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }),
            'Less or equal',
            'Returns true if second value is greater, or both values ear equal.'),
        new Helper(
            '>',
            new E.More(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "More", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }),
            'More',
            'Returns true if first value is greater.'),
        new Helper(
            '>=',
            new E.MoreEqual(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "MoreEqual", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["6"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }),
            'More or equal',
            'Returns true if first value is greater, or both values ear equal.'),
        new Helper(
            '%',
            new E.Modulo(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["15"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "Modulo", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Modulo',
            'Returns the remainder of division of two numbers'),
        new Helper(
            '++',
            new E.Increment(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }),
            'Increment',
            'Increments given variable by 1'),
        new Helper(
            '--',
            new E.Decrement(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "More", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Decrement", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }),
            'Decrement',
            'Decrements given variable by 1'),
        new Helper(
            '++',
            new E.PostIncrement(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "PostIncrement", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }),
            'Post increment',
            'Increments given variable by 1'),
        new Helper(
            '--',
            new E.PostDecrement(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "More", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "PostDecrement", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, []], "visible": true }]], "visible": true }),
            'Post decrement',
            'Decrements given variable by 1'),
        new Helper(
            '&&',
            new E.And(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "And", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["0"], "visible": true }, { "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }], "visible": true }, [{ "element": "Comment", "params": ["Do something"], "visible": true }]], "visible": true }]], "visible": true }),
            'And',
            'Returns true, if both values (on the left and on the right) are true.'),
        new Helper(
            '||',
            new E.Or(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["-6"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "Or", "params": [{ "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["100"], "visible": true }, { "element": "RawData", "params": ["i"], "visible": true }], "visible": true }], "visible": true }, [{ "element": "Comment", "params": ["Do something"], "visible": true }]], "visible": true }]], "visible": true }),
            'Or',
            'Returns true, if any value (on the left or on the right) is true.'),
        new Helper(
            '!',
            new E.Not(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "If", "params": [{ "element": "Not", "params": [{ "element": "Equal", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["1"], "visible": true }], "visible": true }], "visible": true }, [{ "element": "Comment", "params": ["Do something"], "visible": true }]], "visible": true }]], "visible": true }),
            'Not',
            'Returns true, if passed value is false, and false if passed value is true.'),
    ];

    var variableHelpers = [
        new Helper(
            '=',
            new E.Set(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "RawData", "params": ["11"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Set',
            'Sets the value of variable on the left to the value on the right.'),
        new Helper(
            'var',
            new E.VariableDeclaration(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }]], "visible": true }),
            'Variable declaration',
            'Creates a variable of given name and type on the stack and assigns a default value to it.'),
        new Helper(
            'var',
            new E.VariableImplicitDefinition(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["a", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }]], "visible": true }),
            'Variable definition',
            'Creates a variable of given name on the stack and assigns provided value to it.'),
        new Helper(
            'var',
            new E.VariableDefinition(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["a", { "element": "Int", "params": [], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }]], "visible": true }),
            'Variable definition',
            'Creates a variable of given name and type on the stack and assigns provided value to it.'),
        new Helper(
            'ref',
            new E.ReferenceDeclaration(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ReferenceDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "NewHeapObject", "params": [{ "element": "Int", "params": [], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }),
            'Reference',
            'Creates a new reference (that can point at objects of the specific type), places it on the stack and assings null to it.'),
        new Helper(
            'ref',
            new E.ReferenceDefinition(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "ReferenceDefinition", "params": ["a", { "element": "Int", "params": [], "visible": true }, { "element": "NewHeapObject", "params": [{ "element": "Int", "params": [], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }),
            'Reference definition',
            'Creates a new reference (that can point at objects of the specific type), places it on the stack and assings rovided value to it.'),
        new Helper(
            'alias',
            new E.AliasDefinition(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableImplicitDefinition", "params": ["foo", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }, { "element": "AliasDefinition", "params": ["a", { "element": "Int", "params": [], "visible": true }, { "element": "RawData", "params": ["foo"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["2"], "visible": true }], "visible": true }]], "visible": true }),
            'Alias definition',
            'Aliasing is like giving the second name to the variable, that already exists in the memory.'),
        new Helper(
            'alias',
            new E.AliasDeclaration(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["swap", [{ "element": "AliasDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "AliasDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Void", "params": [], "visible": true }, [{ "element": "VariableImplicitDefinition", "params": ["temp", { "element": "RawData", "params": ["a"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["b"], "visible": true }, { "element": "RawData", "params": ["temp"], "visible": true }], "visible": true }]], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["x", { "element": "RawData", "params": ["1"], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["y", { "element": "RawData", "params": ["2"], "visible": true }], "visible": true }, { "element": "FunctionCall", "params": [{ "element": "RawData", "params": ["swap"], "visible": true }, [{ "element": "RawData", "params": ["x"], "visible": true }, { "element": "RawData", "params": ["y"], "visible": true }]], "visible": true }]], "visible": true }),
            'Alias',
            'Aliasing is like giving the second name to the variable, that already exists in the memory.'),
    ];

    var functionHelpers = [
        new Helper(
            'fun',
            new E.Function(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["add", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Int", "params": [], "visible": true }, [{ "element": "Return", "params": [{ "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["foo", { "element": "FunctionCall", "params": [{ "element": "RawData", "params": ["add"], "visible": true }, [{ "element": "RawData", "params": ["2"], "visible": true }, { "element": "RawData", "params": ["4"], "visible": true }]], "visible": true }], "visible": true }]], "visible": true }),
            'Function definition',
            'Creates a new function and places it on the stack. Function has a name, which enables us to call it later, parameters list, which indicates arguments to be passed during the call and a type, of which the returned by functon value must be. Parapeters can be variables, references or alaises. After that there is the body of the function. If the sunction is defined inside the class definiton it becomes a method, which has access to the special reference "this"'),
        new Helper(
            '()',
            new E.FunctionCall(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["add", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Int", "params": [], "visible": true }, [{ "element": "Return", "params": [{ "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["foo", { "element": "FunctionCall", "params": [{ "element": "RawData", "params": ["add"], "visible": true }, [{ "element": "RawData", "params": ["2"], "visible": true }, { "element": "RawData", "params": ["4"], "visible": true }]], "visible": true }], "visible": true }]], "visible": true }),
            'Function call',
            'Enables us to call previously defined function. Provided arguments must much parameters list.'),
        new Helper(
            'return',
            new E.Return(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["add", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Int", "params": [], "visible": true }, [{ "element": "Return", "params": [{ "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["foo", { "element": "FunctionCall", "params": [{ "element": "RawData", "params": ["add"], "visible": true }, [{ "element": "RawData", "params": ["2"], "visible": true }, { "element": "RawData", "params": ["4"], "visible": true }]], "visible": true }], "visible": true }]], "visible": true }),
            'Return',
            'Terminates execution of the current function and returns passed value.'),
    ]

    var typeHelpers = [
        new Helper(
            'number',
            new E.Int(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["foo", { "element": "Int", "params": [], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }]], "visible": true }),
            'Number',
            'Standard, numeric type.'),
        new Helper(
            'bool',
            new E.Bool(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["foo", { "element": "Bool", "params": [], "visible": true }, { "element": "True", "params": [], "visible": true }], "visible": true }]], "visible": true }),
            'Bool',
            'Boolean (true/false) type.'),
        new Helper(
            'string',
            new E.String(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["foo", { "element": "String", "params": [], "visible": true }, { "element": "StringLiteral", "params": ["Hello"], "visible": true }], "visible": true }]], "visible": true }),
            'String',
            'Standard, string type.'),
        new Helper(
            'void',
            new E.Void(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["addAndPrint", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Void", "params": [], "visible": true }, [{ "element": "Print", "params": [{ "element": "Add", "params": [{ "element": "RawData", "params": ["a"], "visible": true }, { "element": "RawData", "params": ["b"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }),
            'Void',
            'An empty type.'),
        //new Helper(
        //    'any',
        //    new E.Any(),
        //    Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDefinition", "params": ["foo", { "element": "Any", "params": [], "visible": true }, { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }]], "visible": true }),
        //    'Any',
        //    'Indicates, that every value is comatible with this type.'),
        new Helper(
            'class',
            new E.BaseClassDefinition(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Class", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }, { "element": "Function", "params": ["setA", [{ "element": "VariableDeclaration", "params": ["x", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Void", "params": [], "visible": true }, [{ "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["this"], "visible": true }, "a"], "visible": true }, { "element": "RawData", "params": ["x"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }, { "element": "VariableDeclaration", "params": ["foo", { "element": "RawData", "params": ["Class"], "visible": true }], "visible": true }, { "element": "FunctionCall", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "setA"], "visible": true }, [{ "element": "RawData", "params": ["15"], "visible": true }]], "visible": true }, { "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "b"], "visible": true }, { "element": "RawData", "params": ["31"], "visible": true }], "visible": true }]], "visible": true }),
            'Class definition',
            'Creates a class which consists of the given set of fields and methods. You can create objects of this clas, which then you can use as every other values.'),
        //new Helper(
        //    'class',
        //    new E.ClassDefinition(),
        //    'Class definition',
        //    ''),
        new Helper(
            '.',
            new E.Path(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Class", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }, { "element": "Function", "params": ["setA", [{ "element": "VariableDeclaration", "params": ["x", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Void", "params": [], "visible": true }, [{ "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["this"], "visible": true }, "a"], "visible": true }, { "element": "RawData", "params": ["x"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }, { "element": "VariableDeclaration", "params": ["foo", { "element": "RawData", "params": ["Class"], "visible": true }], "visible": true }, { "element": "FunctionCall", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "setA"], "visible": true }, [{ "element": "RawData", "params": ["15"], "visible": true }]], "visible": true }, { "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "b"], "visible": true }, { "element": "RawData", "params": ["31"], "visible": true }], "visible": true }]], "visible": true }),
            'Path',
            'Returns an alias to the specific field (or method) of the provided object.'),
        new Helper(
            '->',
            new E.PathRef(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Class", [{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableImplicitDefinition", "params": ["b", { "element": "RawData", "params": ["10"], "visible": true }], "visible": true }, { "element": "Function", "params": ["setA", [{ "element": "VariableDeclaration", "params": ["x", { "element": "Int", "params": [], "visible": true }], "visible": true }], { "element": "Void", "params": [], "visible": true }, [{ "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["this"], "visible": true }, "a"], "visible": true }, { "element": "RawData", "params": ["x"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }, { "element": "VariableDeclaration", "params": ["foo", { "element": "RawData", "params": ["Class"], "visible": true }], "visible": true }, { "element": "FunctionCall", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "setA"], "visible": true }, [{ "element": "RawData", "params": ["15"], "visible": true }]], "visible": true }, { "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["foo"], "visible": true }, "b"], "visible": true }, { "element": "RawData", "params": ["31"], "visible": true }], "visible": true }]], "visible": true }),
            'Dereferencing path',
            'Returns an alias to the specific field (or method) of the object pointed by reference.'),
        new Helper(
            'ref',
            new E.Ref(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Function", "params": ["newInt", [], { "element": "Ref", "params": [{ "element": "Int", "params": [], "visible": true }], "visible": true }, [{ "element": "Return", "params": [{ "element": "NewHeapObject", "params": [{ "element": "Int", "params": [], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }, { "element": "ReferenceDefinition", "params": ["foo", { "element": "Int", "params": [], "visible": true }, { "element": "FunctionCall", "params": [{ "element": "RawData", "params": ["newInt"], "visible": true }, []], "visible": true }], "visible": true }]], "visible": true }),
            'Reference',
            'The reference type.'),
        new Helper(
            '[]',
            new E.Array(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDeclaration", "params": ["foo", { "element": "Array", "params": [{ "element": "Int", "params": [], "visible": true }, "4"], "visible": true }], "visible": true }]], "visible": true }),
            'Array',
            'The array type.'),
        new Helper(
            'type of',
            new E.TypeOf(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "VariableDeclaration", "params": ["a", { "element": "Int", "params": [], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["b", { "element": "TypeOf", "params": [{ "element": "RawData", "params": ["a"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Type of',
            'Returns the type of the value.'),
    ]

    var otherHelpers = [
        new Helper(
            'print',
            new E.Print(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Print", "params": [{ "element": "StringLiteral", "params": ["Your name:"], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["name", { "element": "String", "params": [], "visible": true }], "visible": true }, { "element": "Read", "params": [{ "element": "RawData", "params": ["name"], "visible": true }], "visible": true }, { "element": "Print", "params": [{ "element": "Add", "params": [{ "element": "StringLiteral", "params": ["Your name is "], "visible": true }, { "element": "RawData", "params": ["name"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Print',
            'Prints given value to console'),
        new Helper(
            'read',
            new E.Read(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Print", "params": [{ "element": "StringLiteral", "params": ["Your name:"], "visible": true }], "visible": true }, { "element": "VariableDeclaration", "params": ["name", { "element": "String", "params": [], "visible": true }], "visible": true }, { "element": "Read", "params": [{ "element": "RawData", "params": ["name"], "visible": true }], "visible": true }, { "element": "Print", "params": [{ "element": "Add", "params": [{ "element": "StringLiteral", "params": ["Your name is "], "visible": true }, { "element": "RawData", "params": ["name"], "visible": true }], "visible": true }], "visible": true }]], "visible": true }),
            'Read',
            'Reads a value from the input and assings it to the variable'),
        new Helper(
            '//',
            new E.Comment(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "Comment", "params": ["Name of the user"], "visible": true }, { "element": "VariableDeclaration", "params": ["name", { "element": "String", "params": [], "visible": true }], "visible": true }, { "element": "Comment", "params": ["Surname of the user"], "visible": true }, { "element": "VariableDeclaration", "params": ["surname", { "element": "String", "params": [], "visible": true }], "visible": true }, { "element": "Comment", "params": ["Reading name and surname"], "visible": true }, { "element": "Read", "params": [{ "element": "RawData", "params": ["name"], "visible": true }], "visible": true }, { "element": "Read", "params": [{ "element": "RawData", "params": ["surname"], "visible": true }], "visible": true }]], "visible": true }),
            'Comment',
            'Single line, text comment'),
        new Helper(
            '/**/',
            new E.MultilineComment(),
            Serializer.deserialize({ "element": "Program", "params": [[{ "element": "BaseClassDefinition", "params": ["Stack", [{ "element": "VariableImplicitDefinition", "params": ["value", { "element": "RawData", "params": ["0"], "visible": false }], "visible": false }, { "element": "ReferenceDeclaration", "params": ["next", { "element": "RawData", "params": ["Stack"], "visible": false }], "visible": false }]], "visible": false }, { "element": "ReferenceDeclaration", "params": ["top", { "element": "RawData", "params": ["Stack"], "visible": true }], "visible": true }, { "element": "ForLoop", "params": [{ "element": "VariableImplicitDefinition", "params": ["i", { "element": "RawData", "params": ["0"], "visible": true }], "visible": true }, { "element": "Less", "params": [{ "element": "RawData", "params": ["i"], "visible": true }, { "element": "RawData", "params": ["5"], "visible": true }], "visible": true }, { "element": "Increment", "params": [{ "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, [{ "element": "ReferenceDefinition", "params": ["newTop", { "element": "RawData", "params": ["Stack"], "visible": true }, { "element": "NewHeapObject", "params": [{ "element": "RawData", "params": ["Stack"], "visible": true }, []], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["newTop"], "visible": true }, "next"], "visible": true }, { "element": "RawData", "params": ["top"], "visible": true }], "visible": true }, { "element": "MultilineComment", "params": [[{ "element": "Comment", "params": ["This part of code will not execute"], "visible": true }, { "element": "Set", "params": [{ "element": "Path", "params": [{ "element": "RawData", "params": ["newTop"], "visible": true }, "value"], "visible": true }, { "element": "RawData", "params": ["i"], "visible": true }], "visible": true }, { "element": "Set", "params": [{ "element": "RawData", "params": ["top"], "visible": true }, { "element": "RawData", "params": ["newTop"], "visible": true }], "visible": true }]], "visible": true }]], "visible": true }]], "visible": true }),
            'Comment',
            'Multiline line comment'),
    ]

    export var allHelpers: Helper[] =
        [].concat(
            valueHelpers,
            flowHelpers,
            variableHelpers,
            mathHelpers,
            typeHelpers,
            otherHelpers,
            functionHelpers
            );
}

module ProgramsInflater {
    class Helper {
        constructor(
            private program: E.Element,
            public name: string,
            public description: string) {
        }

        public getProgram(): E.Program {
            return <E.Program> this.program.getCopy();
        }
    }

    function inflate(container: JQuery, elements: Helper[], menu: Menu.Menu, programManager: Program.ProgramManager) {
        elements.forEach((value) => {
            var helper = $('<div></div>');
            helper.addClass('helper');

            var name = $('<div></div>');
            name.text(value.name);
            name.addClass('helperName');
            helper.append(name);

            var description = $('<div></div>');
            description.text(value.description);
            description.addClass('helperDescription');
            helper.append(description);

            var helperButton = $('<div>Load</div>');
            helperButton.addClass('helperButton');
            helper.append(helperButton);

            helperButton.click(() => {
                programManager.setProgram(value.getProgram());
            });

            var programToDisplay = value.getProgram();

            helper.mouseenter(() => {
                programManager.setPreview(programToDisplay);
                programManager.showIDEPart(Program.IDEParts.Preview);
            });
            helper.mouseleave(() => {
                programManager.showIDEPart(Program.IDEParts.Code);
            });

            container.append(helper);
        });
    }

    export function inflateWithStructuresHelpers(container: JQuery, menu: Menu.Menu, programManager: Program.ProgramManager) {
        inflate(container, structuresHelpers, menu, programManager);
    }
    export function inflateWithSortHelpers(container: JQuery, menu: Menu.Menu, programManager: Program.ProgramManager) {
        inflate(container, sortHelpers, menu, programManager);
    }

    export var structuresHelpers = [
        new Helper(Serializer.deserialize(
            {"element":"Program","params":[[{"element":"BaseClassDefinition","params":["Stack",[{"element":"VariableImplicitDefinition","params":["value",{"element":"RawData","params":["0"],"visible":true}],"visible":true},{"element":"ReferenceDeclaration","params":["next",{"element":"RawData","params":["Stack"],"visible":true}],"visible":true}]],"visible":true},{"element":"ReferenceDeclaration","params":["top",{"element":"RawData","params":["Stack"],"visible":true}],"visible":true},{"element":"ForLoop","params":[{"element":"VariableImplicitDefinition","params":["i",{"element":"RawData","params":["0"],"visible":true}],"visible":true},{"element":"Less","params":[{"element":"RawData","params":["i"],"visible":true},{"element":"RawData","params":["5"],"visible":true}],"visible":true},{"element":"Increment","params":[{"element":"RawData","params":["i"],"visible":true}],"visible":true},[{"element":"ReferenceDefinition","params":["newTop",{"element":"RawData","params":["Stack"],"visible":true},{"element":"NewHeapObject","params":[{"element":"RawData","params":["Stack"],"visible":true},[]],"visible":true}],"visible":true},{"element":"Set","params":[{"element":"Path","params":[{"element":"RawData","params":["newTop"],"visible":true},"next"],"visible":true},{"element":"RawData","params":["top"],"visible":true}],"visible":true},{"element":"Set","params":[{"element":"Path","params":[{"element":"RawData","params":["newTop"],"visible":true},"value"],"visible":true},{"element":"RawData","params":["i"],"visible":true}],"visible":true},{"element":"Set","params":[{"element":"RawData","params":["top"],"visible":true},{"element":"RawData","params":["newTop"],"visible":true}],"visible":true}]],"visible":true},{"element":"ForLoop","params":[{"element":"VariableImplicitDefinition","params":["i",{"element":"RawData","params":["top"],"visible":true}],"visible":true},{"element":"NotEqual","params":[{"element":"RawData","params":["i"],"visible":true},{"element":"Null","params":[],"visible":true}],"visible":true},{"element":"Set","params":[{"element":"RawData","params":["i"],"visible":true},{"element":"Path","params":[{"element":"RawData","params":["i"],"visible":true},"next"],"visible":true}],"visible":true},[{"element":"Print","params":[{"element":"Path","params":[{"element":"RawData","params":["i"],"visible":true},"value"],"visible":true}],"visible":true}]],"visible":true}]],"visible":true}
            ), 'Stack', 'Simple stack implementation based on one way linked list'),
    ];

    export var sortHelpers = [];
}