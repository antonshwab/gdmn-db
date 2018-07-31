import { AConnection } from "./AConnection";
import { AConnectionPool } from "./AConnectionPool";
import { ATransaction } from "./ATransaction";
import { DBStructure } from "./DBStructure";
import { IDefaultConnectionPoolOptions } from "./default/connectionPool/DefaultConnectionPool";
import { AService } from "./AService";
export declare abstract class ADriver<PoolOptions = any> {
    /** Reade database structure as DBStructure object */
    readDBStructure(connection: AConnection, transaction?: ATransaction): Promise<DBStructure>;
    /** Create object for access absolute the database */
    newConnection(): AConnection;
    /**
     * Create object for access absolute a specific connection pool of driver.
     * May not be available for the current driver.
     */
    newConnectionPool(): AConnectionPool<PoolOptions>;
    /**
     * Create object for access absolute a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    newDefaultConnectionPool(): AConnectionPool<IDefaultConnectionPoolOptions>;
    abstract newService(): AService;
}
