import { ATransaction, QuerySeqCallback } from "../ATransaction";
import FBDatabase from "./FBDatabase";
export declare class FirebirdTransaction extends ATransaction {
    private _database;
    private _transaction;
    constructor(database: FBDatabase);
    start(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): Promise<boolean>;
    query(query: string, params?: any[]): Promise<any[]>;
    querySequentially(query: string, callback: QuerySeqCallback, params?: any[]): Promise<void>;
}
