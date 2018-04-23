import { AConnection } from "./AConnection";
import { AConnectionPool } from "./AConnectionPool";
import { ATransaction } from "./ATransaction";
import { DBStructure } from "./DBStructure";
import { IDefaultConnectionPoolOptions } from "./default/connectionPool/DefaultConnectionPool";
export declare abstract class ADriver<PoolOptions = any> {
    /** Reade database structure as DBStructure object */
    readDBStructure(transaction: ATransaction): Promise<DBStructure>;
    /** Create object for access to the database */
    newConnection(): AConnection;
    /**
     * Create object for access to a specific parent pool of driver.
     * May not be available for the current driver.
     */
    newConnectionPool(): AConnectionPool<PoolOptions>;
    /**
     * Create object for access to a default parent pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    newDefaultConnectionPool(): AConnectionPool<IDefaultConnectionPoolOptions>;
}
