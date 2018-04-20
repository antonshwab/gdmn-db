import { AResultSet, IRow } from "../AResultSet";
import { Attachment } from "./api/attachment";
import { ResultSet } from "./api/resultSet";
import { Transaction } from "./api/transaction";
import { FirebirdBlob } from "./FirebirdBlob";
export declare class FirebirdResultSet extends AResultSet<FirebirdBlob> {
    private readonly _connection;
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
    getBlob(i: number): FirebirdBlob;
    getBlob(name: string): FirebirdBlob;
    getBoolean(i: number): boolean;
    getBoolean(name: string): boolean;
    getDate(i: number): null | Date;
    getDate(name: string): null | Date;
    getNumber(i: number): number;
    getNumber(name: string): number;
    getString(i: number): string;
    getString(name: string): string;
    getAny(i: number): any;
    getAny(name: string): any;
    isNull(i: number): boolean;
    isNull(name: string): boolean;
    getObject(): IRow;
    getArray(): any[];
    getObjects(): Promise<IRow[]>;
    getArrays(): Promise<any[][]>;
    private _getValue(field);
    private _checkClosed();
    private _throwIfBlob(field);
}
