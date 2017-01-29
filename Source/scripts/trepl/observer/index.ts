export interface Observer {
	on(event: string, sender: any, args: any);
}

export class Observable {
	private sender: any;

	constructor(sender: any) {
		this.sender = sender;
	}

	private observers: Set<Observer> = new Set();
	private defaultObserver: Observer;

	public add(observer: Observer) {
		this.observers.add(observer);
	}
	public remove(observer: Observer) {
		this.observers.delete(observer);
	}

	public setDefault(observer: Observer) {
		this.add(observer);
		this.defaultObserver = observer;
	}
	public getDefault(): Observer {
		return this.defaultObserver;
	}

	public emit(name: string, args: any = null) {
		for (var observer of this.observers)
			observer.on(name, this.sender, args);
	}
}