import { MessageMetadata, Statement as NativeStatement } from "node-firebird-native-api";
import { CursorType } from "../AResultSet";
import { AStatement, INamedParams } from "../AStatement";
import { CommonParamsAnalyzer } from "../common/CommonParamsAnalyzer";
import { Result } from "./Result";
import { ResultSet } from "./ResultSet";
import { Transaction } from "./Transaction";
import { IDescriptor } from "./utils/fb-utils";
export interface IStatementSource {
    handler: NativeStatement;
    inMetadata: MessageMetadata;
    inDescriptors: IDescriptor[];
}
export declare class Statement extends AStatement {
    static EXCLUDE_PATTERNS: RegExp[];
    static PLACEHOLDER_PATTERN: RegExp;
    resultSets: Set<ResultSet>;
    source?: IStatementSource;
    private readonly _paramsAnalyzer;
    protected constructor(transaction: Transaction, paramsAnalyzer: CommonParamsAnalyzer, source?: IStatementSource);
    readonly transaction: Transaction;
    readonly disposed: boolean;
    static prepare(transaction: Transaction, sql: string): Promise<Statement>;
    dispose(): Promise<void>;
    executeQuery(params?: any[] | INamedParams, type?: CursorType): Promise<ResultSet>;
    executeReturning(params?: any[] | INamedParams): Promise<Result>;
    execute(params?: any[] | INamedParams): Promise<void>;
    private _closeChildren;
}
