import { Attachment } from "node-firebird-driver-native";
import { ATransaction, INamedParams, ITransactionOptions } from "../ATransaction";
import { DBStructure } from "../DBStructure";
import { FirebirdResultSet } from "./FirebirdResultSet";
import { FirebirdStatement } from "./FirebirdStatement";
export declare class FirebirdTransaction extends ATransaction<FirebirdResultSet, FirebirdStatement> {
    private readonly _connect;
    private _transaction;
    constructor(connect: Attachment, options?: ITransactionOptions);
    start(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): Promise<boolean>;
    prepareSQL(sql: string): Promise<FirebirdStatement>;
    executeSQL(sql: string, params?: any[] | INamedParams): Promise<FirebirdResultSet>;
    readDBStructure(): Promise<DBStructure>;
}
