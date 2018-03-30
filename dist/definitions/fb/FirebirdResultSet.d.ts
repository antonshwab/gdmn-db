/// <reference types="node" />
import { EventEmitter } from "events";
import { AResultSet, TRow } from "../AResultSet";
export declare class FirebirdResultSet extends AResultSet {
    private readonly _data;
    private _currentIndex;
    private _event;
    private _nextFn;
    private _done;
    constructor(event: EventEmitter);
    readonly position: number;
    next(): Promise<boolean>;
    previous(): Promise<boolean>;
    to(i: number): Promise<boolean>;
    first(): Promise<boolean>;
    last(): Promise<boolean>;
    close(): Promise<void>;
    getBlobBuffer(i: number): Promise<null | Buffer>;
    getBlobBuffer(name: string): Promise<null | Buffer>;
    getBlobStream(i: number): Promise<null | NodeJS.ReadableStream>;
    getBlobStream(name: string): Promise<null | NodeJS.ReadableStream>;
    getBoolean(i: number): null | boolean;
    getBoolean(name: string): null | boolean;
    getDate(i: number): null | Date;
    getDate(name: string): null | Date;
    getNumber(i: number): null | number;
    getNumber(name: string): null | number;
    getString(i: number): null | string;
    getString(name: string): null | string;
    getAny(i: number): any;
    getAny(name: string): any;
    getObject(): TRow;
    getArray(): any[];
    getObjects(): Promise<TRow[]>;
    getArrays(): Promise<any[][]>;
    private getWaitNext();
    private _getValue(field);
}
