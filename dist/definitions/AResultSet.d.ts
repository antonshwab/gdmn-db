/// <reference types="node" />
export declare type TRow = {
    [fieldName: string]: any;
};
export declare abstract class AResultSet {
    readonly abstract position: number;
    abstract next(): Promise<boolean>;
    abstract previous(): Promise<boolean>;
    abstract to(i: number): Promise<boolean>;
    abstract first(): Promise<boolean>;
    abstract last(): Promise<boolean>;
    abstract close(): Promise<void>;
    abstract getBlobBuffer(i: number): Promise<null | Buffer>;
    abstract getBlobBuffer(name: string): Promise<null | Buffer>;
    abstract getBlobBuffer(field: number | string): Promise<null | Buffer>;
    abstract getBlobStream(i: number): Promise<null | NodeJS.ReadableStream>;
    abstract getBlobStream(name: string): Promise<null | NodeJS.ReadableStream>;
    abstract getBlobStream(field: number | string): Promise<null | NodeJS.ReadableStream>;
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
    abstract getObjects(): Promise<TRow[]>;
    abstract getArrays(): Promise<any[][]>;
}
