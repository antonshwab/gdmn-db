import {createPool, Pool} from "generic-pool";
import {AConnection, IConnectionOptions} from "../../AConnection";
import {AConnectionPool} from "../../AConnectionPool";
import {ConnectionProxy} from "./DefaultConnectionProxy";

export interface IDefaultConnectionPoolOptions {    // from require(generic-pool).Options
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
     * Supercedes {@link IDefaultConnectionPoolOptions.softIdleTimeoutMillis}
     *
     * @default 30000
     */
    idleTimeoutMillis?: number;
}

export type ConnectionCreator<Connection> = () => Connection;

export class DefaultConnectionPool extends AConnectionPool<IDefaultConnectionPoolOptions> {

    private readonly _connectionCreator: ConnectionCreator<AConnection>;
    private _connectionPool: null | Pool<AConnection> = null;

    constructor(connectionCreator: ConnectionCreator<AConnection>) {
        super();
        this._connectionCreator = connectionCreator;
    }

    public async create(dbOptions: IConnectionOptions, options: IDefaultConnectionPoolOptions): Promise<void> {
        if (this._connectionPool) {
            throw new Error("Connection pool already created");
        }

        this._connectionPool = createPool({
            create: async () => {
                if (!this._connectionPool) {
                    throw new Error("This error should never been happen");
                }

                const proxy = new ConnectionProxy(this._connectionPool, this._connectionCreator);
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

    public async destroy(): Promise<void> {
        if (!this._connectionPool) {
            throw new Error("Connection pool need created");
        }

        await this._connectionPool.drain();
        await this._connectionPool.clear();
        this._connectionPool = null;
    }

    public async get(): Promise<AConnection> {
        if (!this._connectionPool) {
            throw new Error("Connection pool need created");
        }

        return await this._connectionPool.acquire();
    }

    public async isCreated(): Promise<boolean> {
        return Boolean(this._connectionPool);
    }
}
