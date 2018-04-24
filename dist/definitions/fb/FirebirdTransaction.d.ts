import { Transaction } from "node-firebird-native-api";
import { ATransaction, INamedParams, ITransactionOptions } from "../ATransaction";
import { FirebirdBlob } from "./FirebirdBlob";
import { FirebirdConnection } from "./FirebirdConnection";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { FirebirdStatement } from "./FirebirdStatement";
export declare class FirebirdTransaction extends ATransaction<FirebirdBlob, FirebirdResultSet, FirebirdStatement> {
    static EXCLUDE_PATTERNS: RegExp[];
    static PLACEHOLDER_PATTERN: RegExp;
    readonly parent: FirebirdConnection;
    statements: Set<FirebirdStatement>;
    handler?: Transaction;
    protected constructor(parent: FirebirdConnection, options?: ITransactionOptions);
    static create(parent: FirebirdConnection, options?: ITransactionOptions): Promise<FirebirdTransaction>;
    start(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): Promise<boolean>;
    prepare(sql: string): Promise<FirebirdStatement>;
    executeQuery(sql: string, params?: any[] | INamedParams): Promise<FirebirdResultSet>;
    execute(sql: string, params?: any[] | INamedParams): Promise<void>;
    private closeChildren();
}
