import { AConnectionPool } from "../AConnectionPool";
import { ADatabase } from "../ADatabase";
import { ADriver } from "../ADriver";
import { IDefaultConnectionPoolOptions } from "../default/connectionPool/DefaultConnectionPool";
export declare class FirebirdDriver extends ADriver {
    /**
     * Create object for access to a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    newDefaultConnectionPool(): AConnectionPool<IDefaultConnectionPoolOptions>;
    /** Do not support this driver */
    newConnectionPool(): AConnectionPool<any>;
    /** Create object for access to the database */
    newDatabase(): ADatabase;
}
