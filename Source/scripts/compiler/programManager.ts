module Program {
    export enum IDEParts {
        Code,
        Preview,
        Description
    }

    export class ProgramManager implements E.ElementParent {
        constructor(
            private codeField: JQuery,
            private stack: JQuery,
            private tempStack: JQuery,
            private heap: JQuery,
            private previewField: JQuery,
            private descriptionField: JQuery) {

            this.codeFieldFrame = this.codeField.closest('.IDEPartPage');
            this.previewFieldFrame = this.previewField.closest('.IDEPartPage');
            this.descriptionFieldFrame = this.descriptionField.closest('.IDEPartPage');
        }

        private codeFieldFrame: JQuery;
        private previewFieldFrame: JQuery;
        private descriptionFieldFrame: JQuery;
        private currentProgram: E.Program = new E.Program();
        public onStart: (() => void)[] = [];
        public onDone: (() => void)[] = [];

        setProgram(program: E.Program) {
            this.currentProgram = program;
            this.currentProgram.parent = this;
            var programmElementGUI = this.currentProgram.getElement();
            programmElementGUI.draggable('disable');
            this.codeField.empty();
            this.codeField.append(programmElementGUI);
            this.validate();
        }

        private stopAndClearMemory() {
            MemoryObservers.getEnvironmentObserver().clear();
            BufferManager.getBuffer().clearInputBuffer();
            //GUI.getConsole().clear();
            this.exec = null;
            GUI.getExecutionIndicator().hide();
        }

        stop() {
            this.stopAndClearMemory();

            this.sendDone();
        }

        private sendDone() {
            for (var i = 0; i < this.onDone.length; i++)
                this.onDone[i]();            
        }

        private sendStart() {
            for (var i = 0; i < this.onStart.length; i++)
                this.onStart[i]();              
        }

        validate() {
            var program = this.currentProgram.constructCode();
            try {
                program.compile(new Compiler.TypeEnvironment());
            }
            catch (e) {
            }
        }

        typeEnvironment: Compiler.TypeEnvironment;
        environment: Memory.Environment;
        private compile(): IterableIterator<L.Operation> {
            this.stopAndClearMemory();

            this.typeEnvironment = new Compiler.TypeEnvironment();
            this.environment = new Memory.Environment();

            var program = this.currentProgram.constructCode();
            var success = false;
            try {
                var success = program.compile(new Compiler.TypeEnvironment());
            }
            catch (e) {
                console.log(e);
            }

            if (!success)
                return null;

            return program.run(this.environment);
        }

        private exec: IterableIterator<L.Operation>;
        step(): L.OperationType {
            if (this.exec == null) {
                this.exec = this.compile();

                if (this.exec == null) {
                    GUI.getConsole().printError('Compilation error, see code for more details');
                    return L.OperationType.Done;
                }
                else {
                    GUI.getConsole().printSuccess('Compiled without errors');
                    this.sendStart();
                }
            }

            do {
                try {
                    var next = this.exec.next();
                }
                catch (e) {
                    console.log(e);

                    GUI.getConsole().printError('Execution error: ' + e);
                    this.exec == null;
                    return L.OperationType.Done;
                }
            }
            while (
                !next.done && next.value.operationType == L.OperationType.InternalOperation ||
                !next.done && next.value.element && !next.value.element.getObserver().isDisplayingProgress()
                );

            if (next.done) {
                GUI.getExecutionIndicator().hide();
                GUI.getConsole().printSuccess('Done');
                this.exec = null;

                this.sendDone();

                return L.OperationType.Done;
            }
            else {
                if (next.value.element)
                    next.value.element.getObserver().executing();

                return next.value.operationType;
            }
        }

        toJSON(): string {
            return JSON.stringify(this.currentProgram.toJSONObject());
        }

        // ElementParent interface
        detachElement() {
        }
        attachElement(element: E.Element) { }
        containsElement() { return true; }
        edited() { this.validate(); }

        setPreview(program: E.Program) {
            var guiElement = program.getElement();
            this.previewField.empty();
            this.previewField.append(guiElement);
        }

        showIDEPart(part: IDEParts) {
            this.codeFieldFrame.hide();
            this.previewFieldFrame.hide();
            this.descriptionFieldFrame.hide();

            switch (part) {
                case IDEParts.Code:
                    this.codeFieldFrame.show();
                    break;
                case IDEParts.Preview:
                    this.previewFieldFrame.show();
                    break;
                case IDEParts.Description:
                    this.descriptionFieldFrame.show();
                    break;
            }
        }

        updateMemoryUI() {
            var environamnt = this.environment;
            if (environamnt)
                environamnt.foreachMemoryFields((field) => field.observer.updateUI());
        }

        disableCodeEdition() {
            this.codeField.addClass('runningProgram');
        }

        enableCodeEdition() {
            this.codeField.removeClass('runningProgram');
        }
    }
}