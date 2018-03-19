import { ATransaction } from "../ATransaction";
import { FirebirdResultSet } from "./FirebirdResultSet";
import FBDatabase from "./driver/FBDatabase";
export declare class FirebirdTransaction extends ATransaction<FirebirdResultSet> {
    private readonly _database;
    private _transaction;
    constructor(database: FBDatabase);
    start(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): Promise<boolean>;
    executeSQL(sql: string, params?: any[]): Promise<FirebirdResultSet>;
}
