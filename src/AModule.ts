import {TConnectionPool} from "./AConnectionPool";
import {TDatabase} from "./ADatabase";
import {DefaultConnectionPoolOptions} from "./DefaultConnectionPool";

export abstract class AModule<PoolOptions> {

    /**
     * Create object for access to the database
     *
     * @returns {TDatabase}
     */
    abstract newDatabase(): TDatabase;

    /**
     * Create object for access to a specific connection pool of driver.
     *
     * @returns {TConnectionPool<PoolOptions>}
     */
    abstract newConnectionPool(): TConnectionPool<PoolOptions>;

    /**
     * Create object for access to a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     * @returns {TConnectionPool<DefaultConnectionPoolOptions>}
     */
    abstract newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions>;
}