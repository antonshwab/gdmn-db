import { Attachment } from "node-firebird-driver-native";
import { ATransaction } from "../ATransaction";
import { DBStructure } from "../DBStructure";
import { FirebirdResultSet2 } from "./FirebirdResultSet2";
export declare class FirebirdTransaction2 extends ATransaction<FirebirdResultSet2> {
    private _connect;
    private _transaction;
    constructor(connect: Attachment);
    start(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): Promise<boolean>;
    executeSQL(sql: string, params?: any[]): Promise<FirebirdResultSet2>;
    readDBStructure(): Promise<DBStructure>;
}
