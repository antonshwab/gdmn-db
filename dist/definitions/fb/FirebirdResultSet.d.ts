import { ResultSet as NativeResultSet } from "node-firebird-native-api";
import { AResultSet, IRow } from "../AResultSet";
import { FirebirdBlob } from "./FirebirdBlob";
import { FirebirdStatement } from "./FirebirdStatement";
export declare class FirebirdResultSet extends AResultSet<FirebirdBlob> {
    readonly parent: FirebirdStatement;
    disposeStatementOnClose: boolean;
    private _handler?;
    private _data;
    private _currentIndex;
    private _status;
    protected constructor(parent: FirebirdStatement, handler: NativeResultSet);
    readonly position: number;
    static open(parent: FirebirdStatement): Promise<FirebirdResultSet>;
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
    private _fetch(options?);
}
