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
    getBlobBuffer(i: number): Promise<Buffer>;
    getBlobBuffer(name: string): Promise<Buffer>;
    getBlobStream(i: number): Promise<NodeJS.ReadableStream>;
    getBlobStream(name: string): Promise<NodeJS.ReadableStream>;
    getBoolean(i: number): boolean;
    getBoolean(name: string): boolean;
    getDate(i: number): Date;
    getDate(name: string): Date;
    getNumber(i: number): number;
    getNumber(name: string): number;
    getString(i: number): string;
    getString(name: string): string;
    getObject(): TRow;
    getArray(): any[];
    getObjects(): Promise<TRow[]>;
    getArrays(): Promise<any[][]>;
    private getWaitNext();
    private _getValue(field);
}
