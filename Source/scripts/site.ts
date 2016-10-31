/// <reference path="compiler/compiler.ts" />

$(() => {
    var code = $('.codeElement');

    var body = $('body');

    var codeField = new GUI.Scrollable($('#codeField').find('.IDEPartContent'));
    codeField.getContent().addClass('codeField');

    var previewField = new GUI.Scrollable($('#previewCodeField').find('.IDEPartContent'));
    previewField.getContent().addClass('codeField');

    var stack = new GUI.Scrollable($('#stack'));
    stack.getContent().addClass('stack');

    var heap = new GUI.Scrollable($('#heap'));
    heap.getContent().addClass('heap');

    var tempStack = new GUI.Scrollable($('#tempStack'));
    tempStack.getContent().addClass('tempStack');

    var descriptionField = $('#descriptionIDEPart').find('.IDEPartContent');

    var trash = $('#trash');

    MemoryObservers.getEnvironmentObserver();

    var programManager = new Program.ProgramManager(
        codeField.getContent(),
        stack.getContent(),
        tempStack.getContent(),
        heap.getContent(),
        previewField.getContent(),
        descriptionField);

    var menu = new Menu.Menu($('#IDEPartMenu'), programManager);
    menu.gotoMainMenu();

    GUI.getExecutionIndicator().getElement().insertBefore(codeField.getContent());
    codeField.onScroll = () => { GUI.getExecutionIndicator().updateUI() };
    stack.onScroll = tempStack.onScroll = heap.onScroll = () => { programManager.updateMemoryUI() };

    GUI.setAsTrash(trash);

    GUI.makeResizable($('#IDEPartMenu'), true);
    GUI.makeResizable($('#IDEPartProgram'), true);
    GUI.makeResizable($('#memoryPartTempStakc'), true);
    GUI.makeResizable($('#memoryPartStack'), true);
    GUI.makeResizable($('#IDE'), false);

    programManager.setProgram(<E.Program>Serializer.deserialize(JSON.parse((<any>window).lesson.Code)));
    if ((<any>window).navigationTree) {
        menu.goThroughNavigationTree((<any>window).navigationTree, (<any>window).lesson);
    }

    var running = false;
    var stepDuration = 500;
    var showTempStack = false;
    var autorun = false;

    var runButton = $('#run_button');
    var stepButton = $('#step_button');
    var pauseButton = $('#pause_button');
    var clearButton = $('#clear_button');
    var clearProgramButton = $('#clear_programm_button');

    GUI.disableMenuButton($('#clear_button'));
    GUI.disableMenuButton($('#pause_button'));

    programManager.onStart.push(() => { 
        running = true;

        programManager.disableCodeEdition();

        GUI.enableMenuButton(pauseButton);
        GUI.enableMenuButton(clearButton);
        GUI.disableMenuButton(clearProgramButton);
    });

    programManager.onDone.push(() => {
        running = false;
        autorun = false;

        programManager.enableCodeEdition();

        GUI.enableMenuButton(runButton);
        GUI.enableMenuButton(stepButton);
        GUI.enableMenuButton(clearProgramButton);
        GUI.disableMenuButton(clearButton);
        GUI.disableMenuButton(pauseButton);
    });

    clearButton.click(function() {
        autorun = false;
        programManager.stop();
    });

    clearProgramButton.click(() => programManager.setProgram(new E.Program()));

    var stepFunction = () => {
        var operation = programManager.step();

        while (
            operation != L.OperationType.Done &&
            !showTempStack &&
            operation == L.OperationType.TempMemoryOperation)
            operation = programManager.step();

        return operation;
    }

    runButton.click(function() {
        if (!autorun) {
            autorun = true;

            var refreshfunction = () => {
                if (autorun && stepFunction() != L.OperationType.Done)
                    setTimeout(refreshfunction, stepDuration);
                else
                    autorun = false;
            }
            refreshfunction();

            GUI.enableMenuButton(pauseButton);
        }
    });

    stepButton.click(function() {
        autorun = false;
        stepFunction();

        GUI.enableMenuButton(runButton);
        GUI.disableMenuButton(pauseButton);
    });

    pauseButton.click(function() {
        autorun = false; 

        GUI.enableMenuButton(runButton);
        GUI.disableMenuButton(pauseButton);
    });

    var speedSlider = new GUI.Slider(0, 100, 70, (newValue) => {
        newValue = 101 - newValue;
        newValue = newValue * newValue / 2;
        newValue = Math.round(newValue);
        GUI.getConsole().printInternalMessage('Program step duration changed to ' + newValue + ' ms');
        stepDuration = newValue;
    });
    $('#speedSliderPlaceholder').replaceWith(speedSlider.getElement().addClass('speedSlider'));

    var tempStackCheckBox = new GUI.CheckBox(showTempStack, (value) => {
        showTempStack = value;
        if (value)
            $('#memoryPartTempStakc').removeClass('memoryPartHidden');
        else
            $('#memoryPartTempStakc').addClass('memoryPartHidden');
    });
    $('#tempStackCheckBox').replaceWith(tempStackCheckBox.getElement().addClass('tempStackCheckBox'));

    var help = new GUI.Help($('#help'));
    var helpToolbox = $('<div></div>').addClass('helpToolbox');
    helpToolbox.append($('<h3></h3>').text('Toolbox section'));
    helpToolbox.append($('<div></div>').text('You can use these elements to build your code. Just pick one, drag it and drop it inside "Your code" sectoin in an appropriate place. You can use single part multiple times. Rememder that to find out what selected elemnt does, you simply have to read description or try it out.'));
    helpToolbox.append($('<h3></h3>').text('Basic components of element:'));
    helpToolbox.append($('<div></div>').text('Not editable label:'));
    helpToolbox.append((new JustToShowElements.Label()).getElement());
    helpToolbox.append($('<br/>'));
    helpToolbox.append($('<div></div>').text('Place where you can type in some text, but inside which you can not drop any other element:'));
    helpToolbox.append((new JustToShowElements.Name()).getElement());
    helpToolbox.append($('<br/>'));
    helpToolbox.append($('<div></div>').text('Place inside which you can drop one other element:'));
    helpToolbox.append((new JustToShowElements.DropField()).getElement());
    helpToolbox.append($('<br/>'));
    helpToolbox.append($('<div></div>').text('Place inside which you can drop multiple elements in any order:'));
    helpToolbox.append((new JustToShowElements.DropList()).getElement());
    helpToolbox.append($('<br/>'));
    helpToolbox.append($('<div></div>').text('Instead of dropping new elemnts, you can simply type your code inside those two last types of components.'));
    help.addDescription(
        $('#IDEPartMenu'),
        helpToolbox);

    var helpYourCode = $('<div></div>');
    helpYourCode.append($('<h3></h3>').text('Your code section'));
    helpYourCode.append($('<div></div>').text('You can find here your entire program. To build it you can drag and drop elements from toolbox section, or type the code yourself.'));
    help.addDescription(
        $('#IDEPartProgram'),
        helpYourCode);

    var helpMemory = $('<div></div>');
    helpMemory.append($('<h3></h3>').text('Momory section'));
    helpMemory.append($('<div></div>').text('It is a part, where you can observe in real time how the memory is changing during program execution. On the left side you can see a stack, and on the right side a heap. All ralations between memory fields and all scopes are being displayed too.'));
    help.addDescription(
        $('#IDEPartMemory'),
        helpMemory);

    var helpMemory = $('<div></div>');
    helpMemory.append($('<div></div>').text('Top bar is a place from which you can control execution of your program.'));
    help.addDescription(
        $('#topBar'),
        helpMemory);

    var helpConsole = $('<div></div>');
    helpConsole.append($('<div></div>').text('In console you can find all messages printed by your program during execution. It is also a source of input for your program.'));
    help.addDescription(
        $('#console'),
        helpConsole);

    GUI.getConsole().clear();
    GUI.getConsole().printInternalMessage('This is still an early version of this application. Some things might not work correcty, others might not work at all.');

    $(() => {
        codeField.updateUI();
        previewField.updateUI();
        stack.updateUI();
        heap.updateUI();
        tempStack.updateUI();
        menu.updateUI();
        GUI.getConsole().updateUI();
    });
});