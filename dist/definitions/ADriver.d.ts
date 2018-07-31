import { AConnection } from "./AConnection";
import { AConnectionPool } from "./AConnectionPool";
import { AService } from "./AService";
import { ATransaction } from "./ATransaction";
import { ICommonConnectionPoolOptions } from "./common/connectionPool/CommonConnectionPool";
import { DBStructure } from "./DBStructure";
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
     * Create service for backup/restore databases
     */
    newService(): AService;
    /**
     * Create object for access absolute a common connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    newCommonConnectionPool(): AConnectionPool<ICommonConnectionPoolOptions>;
}
