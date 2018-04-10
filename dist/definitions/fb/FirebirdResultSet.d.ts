/// <reference types="node" />
import { Attachment, ResultSet, Transaction } from "node-firebird-driver-native";
import { AResultSet, IRow } from "../AResultSet";
export declare class FirebirdResultSet extends AResultSet {
    private readonly _connect;
    private readonly _transaction;
    private readonly _resultSet;
    private _data;
    private _currentIndex;
    private _status;
    constructor(connect: Attachment, transaction: Transaction, resultSet: ResultSet);
    readonly position: number;
    next(): Promise<boolean>;
    previous(): Promise<boolean>;
    to(i: number): Promise<boolean>;
    beforeFirst(): Promise<void>;
    afterLast(): Promise<void>;
    first(): Promise<boolean>;
    last(): Promise<boolean>;
    isBeforeFirst(): Promise<boolean>;
    isAfterLast(): Promise<boolean>;
    isFirst(): Promise<boolean>;
    isLast(): Promise<boolean>;
    isClosed(): Promise<boolean>;
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
    getObject(): IRow;
    getArray(): any[];
    getObjects(): Promise<IRow[]>;
    getArrays(): Promise<any[][]>;
    private _getValue(field);
    private _checkClosed();
}
