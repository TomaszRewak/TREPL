import { Program } from '../blocks/Program'
import { ProgramManager } from '../ide/ProgramManager'
import { Serialized } from '../elements/Serializer'

export class Downloader {
	static downloadProgram(programManager: ProgramManager) {
		var json = programManager.toJSON();
		console.log(json);
		var blob = new Blob([json], {
			type: 'text/plain;charset=utf-8;',
		});
		saveAs(blob, 'My program.txt');
	}

	static createUploadForm(programManager: ProgramManager): JQuery {
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
					var program = Serialized.deserialize(JSON.parse(code));

					if (program instanceof Program)
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