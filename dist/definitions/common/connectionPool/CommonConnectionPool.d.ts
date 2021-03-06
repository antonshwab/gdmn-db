import { AConnection, IConnectionOptions } from "../../AConnection";
import { AConnectionPool } from "../../AConnectionPool";
export interface ICommonConnectionPoolOptions {
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
     * Supercedes {@link ICommonConnectionPoolOptions.softIdleTimeoutMillis}
     *
     * @default 30000
     */
    idleTimeoutMillis?: number;
}
export declare type ConnectionCreator<Connection> = () => Connection;
export declare class CommonConnectionPool extends AConnectionPool<ICommonConnectionPoolOptions> {
    private readonly _connectionCreator;
    private _connectionPool;
    constructor(connectionCreator: ConnectionCreator<AConnection>);
    readonly created: boolean;
    create(dbOptions: IConnectionOptions, options: ICommonConnectionPoolOptions): Promise<void>;
    destroy(): Promise<void>;
    get(): Promise<AConnection>;
}
