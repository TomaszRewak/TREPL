export abstract class Console {
	private _consoleInput: string[] = [];
	public addConsoleInput(message: string) {
		this._consoleInput.push(message);
	}
	public hasConsoleInput(): boolean {
		return this._consoleInput.length > 0;
	}
	public getConsoleInput(): string {
		return this._consoleInput.shift();
	}
	public requestConsoleInput() {
		GUI.getConsole().requestConsoleInput();
	}
	public clearInputBuffer() {
		this._consoleInput = [];
	}

	abstract print(message: string);
}