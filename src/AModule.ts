import {TConnectionPool} from "./AConnectionPool";
import {TDatabase} from "./ADatabase";
import {DefaultConnectionPoolOptions} from "./DefaultConnectionPool";

export abstract class AModule<PoolOptions, DBOptions> {

    abstract newDatabase(): TDatabase<DBOptions>;

    abstract newConnectionPool(): TConnectionPool<PoolOptions, DBOptions>;

    abstract newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions, DBOptions>;
}