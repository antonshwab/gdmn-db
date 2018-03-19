/// <reference types="node" />
import { AResultSet, Row } from "../AResultSet";
export declare class FirebirdResultSet extends AResultSet {
    private readonly _data;
    private _currentIndex;
    constructor(data: Row[]);
    next(): Promise<boolean>;
    previous(): Promise<boolean>;
    to(i: number): Promise<boolean>;
    first(): Promise<boolean>;
    last(): Promise<boolean>;
    getBlob(i: number): Promise<NodeJS.ReadableStream>;
    getBlob(name: string): Promise<NodeJS.ReadableStream>;
    getBoolean(i: number): boolean;
    getBoolean(name: string): boolean;
    getDate(i: number): Date;
    getDate(name: string): Date;
    getNumber(i: number): number;
    getNumber(name: string): number;
    getString(i: number): string;
    getString(name: string): string;
    getObject(): Row;
    getObjects(): Row[];
    private _getValue(field);
}
