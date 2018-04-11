import { Attachment } from "node-firebird-driver-native";
import { ATransaction, INamedParams, ITransactionOptions } from "../ATransaction";
import { DBStructure } from "../DBStructure";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { FirebirdStatement } from "./FirebirdStatement";
export declare class FirebirdTransaction extends ATransaction<FirebirdResultSet, FirebirdStatement> {
    static EXCLUDE_PATTERNS: RegExp[];
    static PLACEHOLDER_PATTERN: RegExp;
    private readonly _connect;
    private _transaction;
    constructor(connect: Attachment, options?: ITransactionOptions);
    start(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): Promise<boolean>;
    prepare(sql: string): Promise<FirebirdStatement>;
    executeQuery(sql: string, params?: any[] | INamedParams): Promise<FirebirdResultSet>;
    execute(sql: string, params?: any[] | INamedParams | null): Promise<void>;
    readDBStructure(): Promise<DBStructure>;
}
