import {AConnection} from "./AConnection";
import {AConnectionPool} from "./AConnectionPool";
import {ATransaction} from "./ATransaction";
import {DBStructure} from "./DBStructure";
import {DefaultConnectionPool, IDefaultConnectionPoolOptions} from "./default/connectionPool/DefaultConnectionPool";

export abstract class ADriver<PoolOptions = any> {

    /** Reade database structure as DBStructure object */
    public async readDBStructure(connection: AConnection, transaction?: ATransaction): Promise<DBStructure> {
        throw new Error("Unsupported yet");
    }

    /** Create object for access absolute the database */
    public newConnection(): AConnection {
        throw new Error("Unsupported yet");
    }

    /**
     * Create object for access absolute a specific connection pool of driver.
     * May not be available for the current driver.
     */
    public newConnectionPool(): AConnectionPool<PoolOptions> {
        throw new Error("Unsupported yet");
    }

    /**
     * Create object for access absolute a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    public newDefaultConnectionPool(): AConnectionPool<IDefaultConnectionPoolOptions> {
        return new DefaultConnectionPool(() => this.newConnection());
    }
}
