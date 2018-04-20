import { ATransaction, INamedParams, ITransactionOptions } from "../ATransaction";
import { Attachment } from "./api/attachment";
import { FirebirdBlob } from "./FirebirdBlob";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { FirebirdStatement } from "./FirebirdStatement";
export declare class FirebirdTransaction extends ATransaction<FirebirdBlob, FirebirdResultSet, FirebirdStatement> {
    static EXCLUDE_PATTERNS: RegExp[];
    static PLACEHOLDER_PATTERN: RegExp;
    private readonly _connection;
    private _transaction;
    constructor(connect: Attachment, options?: ITransactionOptions);
    start(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): Promise<boolean>;
    prepare(sql: string): Promise<FirebirdStatement>;
    executeQuery(sql: string, params?: any[] | INamedParams): Promise<FirebirdResultSet>;
    execute(sql: string, params?: any[] | INamedParams): Promise<void>;
}
