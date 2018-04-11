import {TConnectionPool} from "../AConnectionPool";
import {TDatabase} from "../ADatabase";
import {ADriver} from "../ADriver";
import {DefaultConnectionPool, IDefaultConnectionPoolOptions} from "../default/connectionPool/DefaultConnectionPool";
import {FirebirdDatabase} from "./FirebirdDatabase";

export class FirebirdDriver extends ADriver<void> {

    /**
     * Create object for access to a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    public newDefaultConnectionPool(): TConnectionPool<IDefaultConnectionPoolOptions> {
        return new DefaultConnectionPool(() => new FirebirdDatabase());
    }

    /** Do not support this driver */
    public newConnectionPool(): TConnectionPool<void> {
        throw new Error("Unsupported yet");
    }

    /** Create object for access to the database */
    public newDatabase(): TDatabase {
        return new FirebirdDatabase();
    }
}
