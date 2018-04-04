import {createPool, Pool} from "generic-pool";
import {AConnectionPool} from "./AConnectionPool";
import {ADatabase, TDatabase, TDBOptions} from "./ADatabase";
import {TTransaction} from "./ATransaction";
import {TStatement} from "./AStatement";
import {AResultSet} from "./AResultSet";

export type DefaultConnectionPoolOptions = {    //from require(generic-pool).Options
    /**
     * Maximum number of resources to create at any given time.
     *
     * @default 1
     */
    max?: number;
    /**
     * Minimum number of resources to keep in pool at any given time.
     * If this is set >= max, the pool will silently set the min to
     * equal max.
     *
     * @default 0
     */
    min?: number;
    /**
     * Maximum number of queued requests allowed, additional acquire
     * calls will be callback with an err in a future cycle of the
     * event loop.
     */
    maxWaitingClients?: number;
    /**
     * Should the pool validate resources before giving them to
     * clients. Requires that either factory.validate or
     * factory.validateAsync to be specified
     */
    testOnBorrow?: boolean;
    /**
     * Max milliseconds an acquire call will wait for a resource
     * before timing out. (default no limit), if supplied should
     * non-zero positive integer.
     */
    acquireTimeoutMillis?: number;
    /**
     * If true the oldest resources will be first to be allocated.
     * If false the most recently released resources will be the
     * first to be allocated. This in effect turns the pool's
     * behaviour from a queue into a stack.
     *
     * @default true
     */
    fifo?: boolean;
    /**
     * Int between 1 and x - if set, borrowers can specify their
     * relative priority in the queue if no resources are available.
     *
     * @default 1
     */
    priorityRange?: number;
    /**
     * Should the pool start creating resources, initialize the
     * evictor, etc once the constructor is called. If false,
     * the pool can be started by calling pool.start, otherwise
     * the first call to acquire will start the pool.
     *
     * @default true
     */
    autostart?: boolean;
    /**
     * How often to run eviction checks.
     *
     * @default 0
     */
    evictionRunIntervalMillis?: number;
    /**
     * Number of resources to check each eviction run.
     *
     * @default 3
     */
    numTestsPerRun?: number;
    /**
     * Amount of time an object may sit idle in the pool before it
     * is eligible for eviction by the idle object evictor (if any),
     * with the extra condition that at least "min idle" object
     * instances remain in the pool.
     *
     * @default -1 (nothing can get evicted)
     */
    softIdleTimeoutMillis?: number;
    /**
     * The minimum amount of time that an object may sit idle in the
     * pool before it is eligible for eviction due to idle time.
     * Supercedes {@link DefaultConnectionPoolOptions.softIdleTimeoutMillis}
     *
     * @default 30000
     */
    idleTimeoutMillis?: number;
};

export type DBCreator<DB> = () => DB;

export class DefaultConnectionPool<DBOptions> extends AConnectionPool<DefaultConnectionPoolOptions, TDBOptions,
    AResultSet, TStatement, TTransaction, TDatabase> {

    private readonly _databaseCreator: DBCreator<TDatabase>;
    private _connectionPool: null | Pool<TDatabase> = null;

    constructor(databaseCreator: DBCreator<TDatabase>) {
        super();
        this._databaseCreator = databaseCreator;
    }

    async create(dbOptions: TDBOptions, options: DefaultConnectionPoolOptions): Promise<void> {
        if (this._connectionPool) throw new Error("Connection pool already created");

        this._connectionPool = createPool({
            create: async () => {
                if (!this._connectionPool) throw new Error("This error should never been happen");

                const proxy = new DatabaseProxy(this._connectionPool, this._databaseCreator);
                await proxy.connect(dbOptions);
                return proxy;
            },
            destroy: async (proxy) => {
                await proxy.disconnect();
                return undefined;
            },
            validate: async (proxy) => await proxy.isConnected()
        }, options);
    }

    async destroy(): Promise<void> {
        if (!this._connectionPool) throw new Error("Connection pool need created");

        await this._connectionPool.drain();
        await this._connectionPool.clear();
        this._connectionPool = null;
    }

    async get(): Promise<TDatabase> {
        if (!this._connectionPool) throw new Error("Connection pool need created");

        return await this._connectionPool.acquire();
    }

    async isCreated(): Promise<boolean> {
        return Boolean(this._connectionPool);
    }
}

class DatabaseProxy<DBOptions> extends ADatabase<TDBOptions, AResultSet, TStatement, TTransaction> {

    private readonly _pool: Pool<TDatabase>;
    private readonly _databaseCreator: () => TDatabase;
    private _database: null | TDatabase = null;

    constructor(pool: Pool<TDatabase>, databaseCreator: () => TDatabase) {
        super();
        this._pool = pool;
        this._databaseCreator = databaseCreator;
    }

    async createDatabase(options: TDBOptions): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    async dropDatabase(): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    async connect(options: TDBOptions): Promise<void> {
        if (this._database) throw new Error("Invalid operation for connection from the pool");

        this._database = this._databaseCreator();
        await this._database.connect(options);
    }

    async disconnect(): Promise<void> {
        if (!this._database) throw new Error("Need database connection");

        if ((<any>this._pool).isBorrowedResource(this)) {//there is no method in the file in .d.ts
            this._pool.release(this);
        } else {
            await this._database.disconnect();
        }
    }

    async createTransaction(): Promise<TTransaction> {
        if (!this._database) throw new Error("Need database connection");
        return this._database.createTransaction();
    }

    async isConnected(): Promise<boolean> {
        if (!this._database) return false;
        return this._database.isConnected();
    }
}