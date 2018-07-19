import { ResultSet as NativeResultSet } from "node-firebird-native-api";
import { AResultMetadata } from "../AResultMetadata";
import { AResultSet, CursorType } from "../AResultSet";
import { BlobImpl } from "./BlobImpl";
import { Result } from "./Result";
import { Statement } from "./Statement";
export interface IResultSetSource {
    handler: NativeResultSet;
    result: Result;
}
export declare class ResultSet extends AResultSet {
    disposeStatementOnClose: boolean;
    source?: IResultSetSource;
    protected constructor(statement: Statement, source: IResultSetSource, type?: CursorType);
    readonly statement: Statement;
    readonly closed: boolean;
    readonly metadata: AResultMetadata;
    static open(statement: Statement, params: any[], type?: CursorType): Promise<ResultSet>;
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
    getAll(): Promise<any[]>;
    isNull(i: number): boolean;
    isNull(name: string): boolean;
    private _checkClosed;
    private _executeMove;
}
