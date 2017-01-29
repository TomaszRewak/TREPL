export interface IType {
	getTypeName(): string;
	assignalbeTo(second: IType): boolean;
}