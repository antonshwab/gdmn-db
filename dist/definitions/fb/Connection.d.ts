import { Attachment as NativeConnection } from "node-firebird-native-api";
import { AConnection, IConnectionOptions } from "../AConnection";
import { AResultSet, CursorType } from "../AResultSet";
import { AStatement, INamedParams } from "../AStatement";
import { ATransaction, ITransactionOptions } from "../ATransaction";
import { Context } from "./Context";
import { Statement } from "./Statement";
import { Transaction } from "./Transaction";
export declare type FirebirdOptions = IConnectionOptions;
export declare class Connection extends AConnection {
    context: Context;
    transactions: Set<Transaction>;
    statements: Set<Statement>;
    handler?: NativeConnection;
    readonly connected: boolean;
    private static _optionsToUri(options);
    createDatabase(options: FirebirdOptions): Promise<void>;
    dropDatabase(): Promise<void>;
    connect(options: FirebirdOptions): Promise<void>;
    startTransaction(options?: ITransactionOptions): Promise<ATransaction>;
    disconnect(): Promise<void>;
    execute(transaction: ATransaction, sql: string, params?: any[] | INamedParams): Promise<void>;
    executeQuery(transaction: Transaction, sql: string, params?: any[] | INamedParams, type?: CursorType): Promise<AResultSet>;
    prepare(transaction: Transaction, sql: string): Promise<AStatement>;
    private _closeChildren();
}
