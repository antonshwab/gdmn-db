import { MessageMetadata, Statement as NativeStatement } from "node-firebird-native-api";
import { CursorType } from "../AResultSet";
import { AStatement, INamedParams } from "../AStatement";
import { DefaultParamsAnalyzer } from "../default/DefaultParamsAnalyzer";
import { ResultSet } from "./ResultSet";
import { Transaction } from "./Transaction";
import { IDescriptor } from "./utils/fb-utils";
export interface IStatmentSource {
    handler: NativeStatement;
    inMetadata: MessageMetadata;
    inDescriptors: IDescriptor[];
}
export declare class Statement extends AStatement {
    resultSets: Set<ResultSet>;
    source?: IStatmentSource;
    private readonly _paramsAnalyzer;
    protected constructor(transaction: Transaction, paramsAnalyzer: DefaultParamsAnalyzer, source?: IStatmentSource);
    readonly transaction: Transaction;
    readonly disposed: boolean;
    static prepare(transaction: Transaction, sql: string): Promise<Statement>;
    dispose(): Promise<void>;
    execute(params?: any[] | INamedParams): Promise<void>;
    executeQuery(params?: any[] | INamedParams, type?: CursorType): Promise<ResultSet>;
    private _closeChildren();
}
