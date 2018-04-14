import { AConnectionPool } from "./AConnectionPool";
import { ADatabase } from "./ADatabase";
import { IDefaultConnectionPoolOptions } from "./default/connectionPool/DefaultConnectionPool";
export declare abstract class ADriver<PoolOptions = any> {
    /** Create object for access to the database */
    abstract newDatabase(): ADatabase;
    /** Create object for access to a specific connection pool of driver. */
    abstract newConnectionPool(): AConnectionPool<PoolOptions>;
    /**
     * Create object for access to a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    abstract newDefaultConnectionPool(): AConnectionPool<IDefaultConnectionPoolOptions>;
}
