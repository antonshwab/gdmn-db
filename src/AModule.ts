import {TConnectionPool} from "./AConnectionPool";
import {TDatabase} from "./ADatabase";
import {DefaultConnectionPoolOptions} from "./DefaultConnectionPool";

export abstract class AModule<PoolOptions> {

    abstract newDatabase(): TDatabase;

    abstract newConnectionPool(): TConnectionPool<PoolOptions>;

    abstract newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions>;
}