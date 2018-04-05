import { Pool } from "generic-pool";
import { ADatabase, IDBOptions, TDatabase } from "../../ADatabase";
import { AResultSet } from "../../AResultSet";
import { TStatement } from "../../AStatement";
import { TTransaction } from "../../ATransaction";
export declare class DatabaseProxy<DBOptions> extends ADatabase<IDBOptions, AResultSet, TStatement, TTransaction> {
    private readonly _pool;
    private readonly _databaseCreator;
    private _database;
    constructor(pool: Pool<TDatabase>, databaseCreator: () => TDatabase);
    createDatabase(options: IDBOptions): Promise<void>;
    dropDatabase(): Promise<void>;
    connect(options: IDBOptions): Promise<void>;
    disconnect(): Promise<void>;
    createTransaction(): Promise<TTransaction>;
    isConnected(): Promise<boolean>;
}
