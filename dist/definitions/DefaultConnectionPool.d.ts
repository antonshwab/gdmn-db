import { Options } from "generic-pool";
import { AConnectionPool } from "./AConnectionPool";
import { TDatabase } from "./ADatabase";
import { TTransaction } from "./ATransaction";
import { TStatement } from "./AStatement";
import { AResultSet } from "./AResultSet";
export declare type DefaultConnectionPoolOptions = Options;
export declare type DBCreator<DB> = () => DB;
export declare class DefaultConnectionPool<DBOptions> extends AConnectionPool<DefaultConnectionPoolOptions, DBOptions, AResultSet, TStatement, TTransaction, TDatabase<DBOptions>> {
    private readonly _databaseCreator;
    private _connectionPool;
    constructor(databaseCreator: DBCreator<TDatabase<DBOptions>>);
    create(dbOptions: DBOptions, options: DefaultConnectionPoolOptions): Promise<void>;
    destroy(): Promise<void>;
    get(): Promise<TDatabase<DBOptions>>;
    isCreated(): Promise<boolean>;
}
