/// <reference types="node" />
import { Attachment, ResultSet, Transaction } from "node-firebird-driver-native";
import { AResultSet, TRow } from "../AResultSet";
export declare class FirebirdResultSet2 extends AResultSet {
    private _connect;
    private _transaction;
    private _resultSet;
    private _data;
    private _currentIndex;
    private _done;
    constructor(connect: Attachment, transaction: Transaction, resultSet: ResultSet);
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
    getObject(): TRow;
    getArray(): any[];
    getObjects(): Promise<TRow[]>;
    getArrays(): Promise<any[][]>;
    private _getValue(field);
}
