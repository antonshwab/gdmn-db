import { MessageMetadata, Statement as NativeStatement } from "node-firebird-native-api";
import { CursorType } from "../AResultSet";
import { AStatement, INamedParams } from "../AStatement";
import { DefaultParamsAnalyzer } from "../default/DefaultParamsAnalyzer";
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
    protected constructor(transaction: Transaction, paramsAnalyzer: DefaultParamsAnalyzer, source?: IStatementSource);
    readonly transaction: Transaction;
    readonly disposed: boolean;
    static prepare(transaction: Transaction, sql: string): Promise<Statement>;
    dispose(): Promise<void>;
    execute(params?: any[] | INamedParams): Promise<void>;
    executeQuery(params?: any[] | INamedParams, type?: CursorType): Promise<ResultSet>;
    private _closeChildren();
}
