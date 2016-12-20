module MemoryManager {
    export function downloadProgram(programManager: Program.ProgramManager) {
        var json = programManager.toJSON();
        console.log(json);
        var blob = new Blob([json], {
            type: 'text/plain;charset=utf-8;',
        });
        saveAs(blob, 'My program.txt');        
    }

    export function createUploadForm(programManager: Program.ProgramManager): JQuery {
        var input = $('<input type="file"/>');

		input.click(() => {
			input.val(null);
		});

		input.change((e: any) => {
			if (!input.val())
				return;

            var file = e.target.files[0];
            if (!file) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e: any) {
                var code = e.target.result;
                try {
                    var program = Serializer.deserialize(JSON.parse(code));

                    if (program instanceof E.Program)
                        programManager.setProgram(program);
                    else
                        throw 'Downloaded element is not a program'
                }
                catch (e) {
                    GUI.getConsole().printError('Selected file is of incorrect type');
                }
            };
            reader.readAsText(file);
        });
        return input;
    }
}