export type TRow = { [fieldName: string]: any };

export abstract class AResultSet {

    abstract get position(): number;

    abstract async next(): Promise<boolean>;

    abstract async previous(): Promise<boolean>;

    abstract async to(i: number): Promise<boolean>;

    abstract async first(): Promise<boolean>;

    abstract async last(): Promise<boolean>;

    abstract async isFirst(): Promise<boolean>;

    abstract async isLast(): Promise<boolean>;

    abstract async close(): Promise<void>;

    abstract async getBlobBuffer(i: number): Promise<null | Buffer>;
    abstract async getBlobBuffer(name: string): Promise<null | Buffer>;
    abstract async getBlobBuffer(field: number | string): Promise<null | Buffer>;

    abstract async getBlobStream(i: number): Promise<null | NodeJS.ReadableStream>;
    abstract async getBlobStream(name: string): Promise<null | NodeJS.ReadableStream>;
    abstract async getBlobStream(field: number | string): Promise<null | NodeJS.ReadableStream>;

    abstract getString(i: number): null | string;
    abstract getString(name: string): null | string;
    abstract getString(field: number | string): null | string;

    abstract getNumber(i: number): null | number;
    abstract getNumber(name: string): null | number;
    abstract getNumber(field: number | string): null | number;

    abstract getBoolean(i: number): null | boolean;
    abstract getBoolean(name: string): null | boolean;
    abstract getBoolean(field: number | string): null | boolean;

    abstract getDate(i: number): null | Date;
    abstract getDate(name: string): null | Date;
    abstract getDate(field: number | string): null | Date;

    abstract getAny(i: number): any;
    abstract getAny(name: string): any;
    abstract getAny(field: number | string): any;

    abstract getObject(): TRow;

    abstract getArray(): any[];

    abstract async getObjects(): Promise<TRow[]>;

    abstract async getArrays(): Promise<any[][]>;
}