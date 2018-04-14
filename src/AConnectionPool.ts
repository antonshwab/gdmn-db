import {AConnection, IConnectionOptions} from "./AConnection";
import {AResultSet} from "./AResultSet";
import {AStatement} from "./AStatement";
import {ATransaction} from "./ATransaction";
import {TExecutor} from "./types";

export abstract class AConnectionPool<Options,
    ConOptions extends IConnectionOptions = IConnectionOptions,
    RS extends AResultSet = AResultSet,
    S extends AStatement<RS> = AStatement<RS>,
    T extends ATransaction<RS, S> = ATransaction<RS, S>,
    C extends AConnection<ConOptions, RS, S, T> = AConnection<ConOptions, RS, S, T>> {

    public static async executeFromParent<Opt, ConOpt, R>(
        sourceCallback: TExecutor<null, AConnectionPool<Opt>>,
        resultCallback: TExecutor<AConnectionPool<Opt>, R>
    ): Promise<R> {
        let connectionPool: undefined | AConnectionPool<Opt>;
        try {
            connectionPool = await sourceCallback(null);
            return await resultCallback(connectionPool);
        } finally {
            if (connectionPool) {
                await connectionPool.destroy();
            }
        }
    }

    /**
     * Example:
     * <pre>
     * const result = await AConnectionPool.executeConnectionPool(Factory.XXModule.newDefaultConnectionPool(),
     *      async (connectionPool) => {
     *          return await AConnectionPool.executeConnection(connectionPool, async (connection) => {
     *              return ...
     *          });
     *      })}
     * </pre>
     */
    public static async executeConnectionPool<Opt, R>(
        connectionPool: AConnectionPool<Opt>,
        connectionOptions: IConnectionOptions,
        options: Opt,
        callback: TExecutor<AConnectionPool<Opt>, R>
    ): Promise<R> {
        return await AConnectionPool.executeFromParent(async () => {
            await connectionPool.create(connectionOptions, options);
            return connectionPool;
        }, callback);
    }

    /**
     * Example:
     * <pre>
     * const result = await AConnectionPool.executeConnection(connectionPool, async (connection) => {
     *      return await AConnection.executeTransaction(transaction, {}, async (transaction) => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    public static async executeConnection<Opt, R>(
        connectionPool: AConnectionPool<Opt>,
        callback: TExecutor<AConnection, R>
    ): Promise<R> {
        return await AConnection.executeFromParent(() => connectionPool.get(), callback);
    }

    /**
     * Is the connection pool prepared?
     *
     * @returns {Promise<boolean>}
     * true if the connection pool created;
     * false if the connection pool destroyed or not created
     */
    public abstract isCreated(): Promise<boolean>;

    /**
     * Prepare the connection pool for use with some database.
     * After work you need to call {@link AConnectionPool.destroy()} method.
     *
     * @param {ConOptions} connectionOptions
     * the options for opening database connection
     * @param {Options} options
     * the options for creating connection pool
     */
    public abstract create(connectionOptions: ConOptions, options: Options): Promise<void>;

    /** Release resources occupied by the connection pool. */
    public abstract destroy(): Promise<void>;

    /**
     * Get free database connection. With this connection you
     * need to work as usual. i.e close it is also necessary
     *
     * @returns {Promise<C extends AConnection<ConOptions, RS, S, T>>}
     */
    public abstract get(): Promise<C>;
}
