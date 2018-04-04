import { AModule } from "../AModule";
import { TConnectionPool } from "../AConnectionPool";
import { TDatabase } from "../ADatabase";
import { DefaultConnectionPoolOptions } from "../DefaultConnectionPool";
export declare class FirebirdModule extends AModule<void> {
    /**
     * Create object for access to a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     * @returns {TConnectionPool<DefaultConnectionPoolOptions>}
     */
    newDefaultConnectionPool(): TConnectionPool<DefaultConnectionPoolOptions>;
    /**
     * Do not support this driver
     *
     * @returns {TConnectionPool<void>}
     */
    newConnectionPool(): TConnectionPool<void>;
    /**
     * Create object for access to the database
     *
     * @returns {TDatabase}
     */
    newDatabase(): TDatabase;
}
