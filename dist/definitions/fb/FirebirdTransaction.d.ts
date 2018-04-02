import { Attachment } from "node-firebird-driver-native";
import { ATransaction } from "../ATransaction";
import { DBStructure } from "../DBStructure";
import { FirebirdStatement } from "./FirebirdStatement";
import { FirebirdResultSet } from "./FirebirdResultSet";
export declare class FirebirdTransaction extends ATransaction<FirebirdResultSet, FirebirdStatement> {
    private readonly _connect;
    private _transaction;
    constructor(connect: Attachment);
    start(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): Promise<boolean>;
    prepareSQL(sql: string): Promise<FirebirdStatement>;
    executeSQL(sql: string, params?: any[]): Promise<FirebirdResultSet>;
    readDBStructure(): Promise<DBStructure>;
}
