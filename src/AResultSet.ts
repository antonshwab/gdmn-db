export type TRow = { [fieldName: string]: any };

export abstract class AResultSet {

    abstract get position(): number;

    abstract async next(): Promise<boolean>;

    abstract async previous(): Promise<boolean>;

    abstract async to(i: number): Promise<boolean>;

    abstract async first(): Promise<boolean>;

    abstract async last(): Promise<boolean>;

    abstract async getBlobBuffer(i: number): Promise<Buffer>;
    abstract async getBlobBuffer(name: string): Promise<Buffer>;
    abstract async getBlobBuffer(field: number | string): Promise<Buffer>;

    abstract async getBlobStream(i: number): Promise<NodeJS.ReadableStream>;
    abstract async getBlobStream(name: string): Promise<NodeJS.ReadableStream>;
    abstract async getBlobStream(field: number | string): Promise<NodeJS.ReadableStream>;

    abstract getString(i: number): string;
    abstract getString(name: string): string;
    abstract getString(field: number | string): string;

    abstract getNumber(i: number): number;
    abstract getNumber(name: string): number;
    abstract getNumber(field: number | string): number;

    abstract getBoolean(i: number): boolean;
    abstract getBoolean(name: string): boolean;
    abstract getBoolean(field: number | string): boolean;

    abstract getDate(i: number): Date;
    abstract getDate(name: string): Date;
    abstract getDate(field: number | string): Date;

    abstract getObject(): TRow;

    abstract getArray(): any[];

    abstract async getObjects(): Promise<TRow[]>;

    abstract async getArrays(): Promise<any[][]>;
}