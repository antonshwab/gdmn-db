import {AConnectionPool} from "./AConnectionPool";
import {ADatabase} from "./ADatabase";
import {DefaultConnectionPool, IDefaultConnectionPoolOptions} from "./default/connectionPool/DefaultConnectionPool";

export abstract class ADriver<PoolOptions = any> {

    /** Create object for access to the database */
    public newDatabase(): ADatabase {
        throw new Error("Unsupported yet");
    }

    /**
     * Create object for access to a specific connection pool of driver.
     * May not be available for the current driver.
     */
    public newConnectionPool(): AConnectionPool<PoolOptions> {
        throw new Error("Unsupported yet");
    }

    /**
     * Create object for access to a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    public newDefaultConnectionPool(): AConnectionPool<IDefaultConnectionPoolOptions> {
        return new DefaultConnectionPool(() => this.newDatabase());
    }
}
