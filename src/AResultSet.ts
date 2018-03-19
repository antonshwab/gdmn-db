export type Row = { [fieldName: string]: any };

export abstract class AResultSet {

    abstract async next(): Promise<boolean>;

    abstract async previous(): Promise<boolean>;

    abstract async to(i: number): Promise<boolean>;

    abstract async first(): Promise<boolean>;

    abstract async last(): Promise<boolean>;

    abstract async getBlob(i: number): Promise<NodeJS.ReadableStream>;
    abstract async getBlob(name: string): Promise<NodeJS.ReadableStream>;
    abstract async getBlob(field: number | string): Promise<NodeJS.ReadableStream>;

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

    abstract getObject(): Row;

    abstract getObjects(): Row[];
}