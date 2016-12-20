export interface MemoryFieldObserver {
	getElement(): JQuery;
	setFieldValue(value: TS.Obj);
	updateUI();
}