/// <reference types="node" />
export declare type TRow = {
    [fieldName: string]: any;
};
export declare abstract class AResultSet {
    abstract next(): Promise<boolean>;
    abstract previous(): Promise<boolean>;
    abstract to(i: number): Promise<boolean>;
    abstract first(): Promise<boolean>;
    abstract last(): Promise<boolean>;
    abstract getBlobBuffer(i: number): Promise<Buffer>;
    abstract getBlobBuffer(name: string): Promise<Buffer>;
    abstract getBlobBuffer(field: number | string): Promise<Buffer>;
    abstract getBlobStream(i: number): Promise<NodeJS.ReadableStream>;
    abstract getBlobStream(name: string): Promise<NodeJS.ReadableStream>;
    abstract getBlobStream(field: number | string): Promise<NodeJS.ReadableStream>;
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
    abstract getObjects(): TRow[];
}
