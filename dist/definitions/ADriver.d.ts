import { TConnectionPool } from "./AConnectionPool";
import { TDatabase } from "./ADatabase";
import { IDefaultConnectionPoolOptions } from "./default/connectionPool/DefaultConnectionPool";
export declare abstract class ADriver<PoolOptions> {
    /** Create object for access to the database */
    abstract newDatabase(): TDatabase;
    /** Create object for access to a specific connection pool of driver. */
    abstract newConnectionPool(): TConnectionPool<PoolOptions>;
    /**
     * Create object for access to a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    abstract newDefaultConnectionPool(): TConnectionPool<IDefaultConnectionPoolOptions>;
}
