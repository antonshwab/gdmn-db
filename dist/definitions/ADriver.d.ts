import { AConnectionPool } from "./AConnectionPool";
import { ADatabase } from "./ADatabase";
import { IDefaultConnectionPoolOptions } from "./default/connectionPool/DefaultConnectionPool";
export declare abstract class ADriver<PoolOptions = any> {
    /** Create object for access to the database */
    newDatabase(): ADatabase;
    /**
     * Create object for access to a specific connection pool of driver.
     * May not be available for the current driver.
     */
    newConnectionPool(): AConnectionPool<PoolOptions>;
    /**
     * Create object for access to a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    newDefaultConnectionPool(): AConnectionPool<IDefaultConnectionPoolOptions>;
}
