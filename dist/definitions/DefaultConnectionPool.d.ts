import { Options } from "generic-pool";
import { AConnectionPool } from "./AConnectionPool";
import { TDatabase, TDBOptions } from "./ADatabase";
import { TTransaction } from "./ATransaction";
import { TStatement } from "./AStatement";
import { AResultSet } from "./AResultSet";
export declare type DefaultConnectionPoolOptions = Options;
export declare type DBCreator<DB> = () => DB;
export declare class DefaultConnectionPool<DBOptions> extends AConnectionPool<DefaultConnectionPoolOptions, TDBOptions, AResultSet, TStatement, TTransaction, TDatabase> {
    private readonly _databaseCreator;
    private _connectionPool;
    constructor(databaseCreator: DBCreator<TDatabase>);
    create(dbOptions: TDBOptions, options: DefaultConnectionPoolOptions): Promise<void>;
    destroy(): Promise<void>;
    get(): Promise<TDatabase>;
    isCreated(): Promise<boolean>;
}
