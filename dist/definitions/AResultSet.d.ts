/// <reference types="node" />
export declare type Row = {
    [fieldName: string]: any;
};
export declare abstract class AResultSet {
    abstract next(): Promise<boolean>;
    abstract previous(): Promise<boolean>;
    abstract to(i: number): Promise<boolean>;
    abstract first(): Promise<boolean>;
    abstract last(): Promise<boolean>;
    abstract getBlob(i: number): Promise<NodeJS.ReadableStream>;
    abstract getBlob(name: string): Promise<NodeJS.ReadableStream>;
    abstract getBlob(field: number | string): Promise<NodeJS.ReadableStream>;
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