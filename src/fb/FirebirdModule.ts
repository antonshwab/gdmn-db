import {TConnectionPool} from "../AConnectionPool";
import {TDatabase} from "../ADatabase";
import {AModule} from "../AModule";
import {DefaultConnectionPool, IDefaultConnectionPoolOptions} from "../default/connectionPool/DefaultConnectionPool";
import {FirebirdDatabase} from "./FirebirdDatabase";

export class FirebirdModule extends AModule<void> {

    /**
     * Create object for access to a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     * @returns {TConnectionPool<IDefaultConnectionPoolOptions>}
     */
    public newDefaultConnectionPool(): TConnectionPool<IDefaultConnectionPoolOptions> {
        return new DefaultConnectionPool(() => new FirebirdDatabase());
    }

    /**
     * Do not support this driver
     *
     * @returns {TConnectionPool<void>}
     */
    public newConnectionPool(): TConnectionPool<void> {
        throw new Error("Unsupported yet");
    }

    /**
     * Create object for access to the database
     *
     * @returns {TDatabase}
     */
    public newDatabase(): TDatabase {
        return new FirebirdDatabase();
    }
}
