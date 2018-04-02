import { Attachment } from "node-firebird-driver-native";
import { ATransaction } from "../ATransaction";
import { DBStructure } from "../DBStructure";
import { FirebirdResultSet } from "./FirebirdResultSet";
export declare class FirebirdTransaction extends ATransaction<FirebirdResultSet> {
    private readonly _connect;
    private _transaction;
    constructor(connect: Attachment);
    start(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): Promise<boolean>;
    executeSQL(sql: string, params?: any[]): Promise<FirebirdResultSet>;
    readDBStructure(): Promise<DBStructure>;
}
