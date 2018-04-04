import { TConnectionPool } from "./AConnectionPool";
import { TDatabase } from "./ADatabase";
import { DefaultConnectionPoolOptions } from "./DefaultConnectionPool";
export declare abstract class AModule<PoolOptions> {
    abstract newDatabase(): TDatabase;
    abstract newConnectionPool(): TConnectionPool<PoolOptions>;
    abstract newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions>;
}
