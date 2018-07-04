import {createPool, Pool} from "generic-pool";
import {AConnection, IConnectionOptions} from "../../AConnection";
import {AConnectionPool} from "../../AConnectionPool";
import {DefaultConnectionProxy} from "./DefaultConnectionProxy";

export interface IDefaultConnectionPoolOptions {    // from require(generic-pool).Options
    /**
     * Maximum number of resources absolute create at any given time.
     *
     * @default 1
     */
    max?: number;
    /**
     * Minimum number of resources absolute keep in pool at any given time.
     * If this is set >= max, the pool will silently set the min absolute
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
     * Max milliseconds an acquire call will wait for a resource
     * before timing out. (default no limit), if supplied should
     * non-zero positive integer.
     */
    acquireTimeoutMillis?: number;
    /**
     * If true the oldest resources will be first absolute be allocated.
     * If false the most recently released resources will be the
     * first absolute be allocated. This in effect turns the pool's
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
     * How often absolute run eviction checks.
     *
     * @default 0
     */
    evictionRunIntervalMillis?: number;
    /**
     * Number of resources absolute check each eviction run.
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
     * pool before it is eligible for eviction due absolute idle time.
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

    get created(): boolean {
        return Boolean(this._connectionPool);
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

                const proxy = new DefaultConnectionProxy(this._connectionPool, this._connectionCreator);
                await proxy.connect(dbOptions);
                return proxy;
            },
            destroy: async (proxy) => {
                await proxy.disconnect();
                return undefined;
            },
            validate: async (proxy) => proxy.connected
        }, {...options, autostart: false, testOnBorrow: true});
        this._connectionPool.addListener("factoryCreateError", console.error);
        this._connectionPool.addListener("factoryDestroyError", console.error);

        (this._connectionPool as any).start();
    }

    public async destroy(): Promise<void> {
        if (!this._connectionPool) {
            throw new Error("Connection pool need created");
        }
        await this._connectionPool.drain();
        // workaround; Wait until quantity minimum connections is established
        await Promise.all(
            Array.from((this._connectionPool as any)._factoryCreateOperations).map(reflector)
        );
        await this._connectionPool.clear();
        this._connectionPool.removeListener("factoryCreateError", console.error);
        this._connectionPool.removeListener("factoryDestroyError", console.error);
        this._connectionPool = null;
    }

    public async get(): Promise<AConnection> {
        if (!this._connectionPool) {
            throw new Error("Connection pool need created");
        }

        return await this._connectionPool.acquire();
    }
}

function noop(): void {
    // ignore
}

/**
 * Reflects a promise but does not expose any
 * underlying value or rejection from that promise.
 * @param  {Promise} promise [description]
 * @return {Promise}         [description]
 */
const reflector = (promise: any) => {
    return promise.then(noop, noop);
};
