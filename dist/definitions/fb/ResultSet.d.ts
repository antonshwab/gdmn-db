import { ResultSet as NativeResultSet } from "node-firebird-native-api";
import { AResultSet, CursorType } from "../AResultSet";
import { AResultSetMetadata } from "../AResultSetMetadata";
import { BlobImpl } from "./BlobImpl";
import { ResultSetMetadata } from "./ResultSetMetadata";
import { Statement } from "./Statement";
export interface IResultSetSource {
    handler: NativeResultSet;
    metadata: ResultSetMetadata;
    buffer: Uint8Array;
}
export declare class ResultSet extends AResultSet {
    disposeStatementOnClose: boolean;
    source?: IResultSetSource;
    protected constructor(statement: Statement, source: IResultSetSource, type?: CursorType);
    readonly statement: Statement;
    readonly closed: boolean;
    readonly metadata: AResultSetMetadata;
    static open(statement: Statement, params: any[], type?: CursorType): Promise<ResultSet>;
    private static _throwIfBlob(value);
    next(): Promise<boolean>;
    previous(): Promise<boolean>;
    absolute(i: number): Promise<boolean>;
    relative(i: number): Promise<boolean>;
    first(): Promise<boolean>;
    last(): Promise<boolean>;
    close(): Promise<void>;
    isBof(): Promise<boolean>;
    isEof(): Promise<boolean>;
    getBlob(i: number): BlobImpl;
    getBlob(name: string): BlobImpl;
    getBoolean(i: number): boolean;
    getBoolean(name: string): boolean;
    getDate(i: number): null | Date;
    getDate(name: string): null | Date;
    getNumber(i: number): number;
    getNumber(name: string): number;
    getString(i: number): string;
    getString(name: string): string;
    getAny(i: number): Promise<any>;
    getAny(name: string): Promise<any>;
    isNull(i: number): boolean;
    isNull(name: string): boolean;
    private _getValue(field);
    private getOutDescriptor(field);
    private _checkClosed();
    private _executeMove(callback);
}
