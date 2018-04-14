import { Pool } from "generic-pool";
import { ADatabase, IDBOptions } from "../../ADatabase";
import { ATransaction } from "../../ATransaction";
export declare class DatabaseProxy extends ADatabase {
    private readonly _pool;
    private readonly _databaseCreator;
    private _database;
    constructor(pool: Pool<ADatabase>, databaseCreator: () => ADatabase);
    createDatabase(options: IDBOptions): Promise<void>;
    dropDatabase(): Promise<void>;
    connect(options: IDBOptions): Promise<void>;
    disconnect(): Promise<void>;
    createTransaction(): Promise<ATransaction>;
    isConnected(): Promise<boolean>;
    private isBorrowed();
}
