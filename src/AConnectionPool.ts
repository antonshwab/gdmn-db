import {ADatabase, IDBOptions, TDatabase} from "./ADatabase";
import {AResultSet, TResultSet} from "./AResultSet";
import {AStatement, TStatement} from "./AStatement";
import {ATransaction, TTransaction} from "./ATransaction";
import {TExecutor} from "./types";

/**
 * Simplified type of {@link AConnectionPool}
 */
export type TConnectionPool<Opt> = AConnectionPool<Opt, IDBOptions, TResultSet, TStatement, TTransaction, TDatabase>;

export abstract class AConnectionPool<Options,
    DBOptions extends IDBOptions,
    RS extends AResultSet,
    S extends AStatement<RS>,
    T extends ATransaction<RS, S>,
    D extends ADatabase<DBOptions, RS, S, T>> {

    public static async executeFromParent<Opt, DBOpt, R>(
        sourceCallback: TExecutor<null, TConnectionPool<Opt>>,
        resultCallback: TExecutor<TConnectionPool<Opt>, R>
    ): Promise<R> {
        let connectionPool: undefined | TConnectionPool<Opt>;
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
     *          return await AConnectionPool.executeDatabase(connectionPool, async (database) => {
     *              return ...
     *          });
     *      })}
     * </pre>
     */
    public static async executeConnectionPool<Opt, R>(
        connectionPool: TConnectionPool<Opt>,
        dbOptions: IDBOptions,
        options: Opt,
        callback: TExecutor<TConnectionPool<Opt>, R>
    ): Promise<R> {
        return await AConnectionPool.executeFromParent(async () => {
            await connectionPool.create(dbOptions, options);
            return connectionPool;
        }, callback);
    }

    /**
     * Example:
     * <pre>
     * const result = await AConnectionPool.executeDatabase(connectionPool, async (database) => {
     *      return await ADatabase.executeTransaction(transaction, {}, async (transaction) => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    public static async executeDatabase<Opt, R>(
        connectionPool: TConnectionPool<Opt>,
        callback: TExecutor<TDatabase, R>
    ): Promise<R> {
        return await ADatabase.executeFromParent(() => connectionPool.get(), callback);
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
     * @param {DBOptions} dbOptions
     * the options for opening database connection
     * @param {Options} options
     * the options for creating connection pool
     */
    public abstract create(dbOptions: DBOptions, options: Options): Promise<void>;

    /** Release resources occupied by the connection pool. */
    public abstract destroy(): Promise<void>;

    /**
     * Get free database connection. With this connection you
     * need to work as usual. i.e close it is also necessary
     *
     * @returns {Promise<D extends ADatabase<DBOptions, RS, S, T>>}
     * the database connection
     */
    public abstract get(): Promise<D>;
}
