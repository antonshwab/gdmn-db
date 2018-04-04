import {TExecutor} from "./types";
import {ADatabase, TDatabase, TDBOptions} from "./ADatabase";
import {ATransaction, TTransaction} from "./ATransaction";
import {AResultSet, TResultSet} from "./AResultSet";
import {AStatement, TStatement} from "./AStatement";

export type TConnectionPool<Opt> = AConnectionPool<Opt, TDBOptions, TResultSet, TStatement, TTransaction,
    TDatabase>;

export abstract class AConnectionPool<Options,
    DBOptions extends TDBOptions,
    RS extends AResultSet,
    S extends AStatement<RS>,
    T extends ATransaction<RS, S>,
    D extends ADatabase<DBOptions, RS, S, T>> {

    static async executeFromParent<Opt, DBOpt, R>(sourceCallback: TExecutor<null, TConnectionPool<Opt>>,
                                                  resultCallback: TExecutor<TConnectionPool<Opt>, R>): Promise<R> {
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
     *
     * @param {TConnectionPool<Opt>} connectionPool
     * @param {TDBOptions} dbOptions
     * @param {Opt} options
     * @param {TExecutor<TConnectionPool<Opt>, R>} callback
     * @returns {Promise<R>}
     */
    static async executeConnectionPool<Opt, R>(
        connectionPool: TConnectionPool<Opt>,
        dbOptions: TDBOptions,
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
     *
     * @param {TConnectionPool<Opt>} connectionPool
     * @param {TExecutor<TDatabase, R>} callback
     * @returns {Promise<R>}
     */
    static async executeDatabase<Opt, R>(
        connectionPool: TConnectionPool<Opt>,
        callback: TExecutor<TDatabase, R>
    ): Promise<R> {
        return await ADatabase.executeFromParent(() => connectionPool.get(), callback);
    }

    /**
     * Is the connection pool prepared?
     *
     * @returns {Promise<boolean>}
     */
    abstract isCreated(): Promise<boolean>;

    /**
     * Prepare the connection pool for use with some database.
     * After work you need to call {@link AConnectionPool.destroy()} method.
     *
     * @param {DBOptions} dbOptions
     * @param {Options} options
     * @returns {Promise<void>}
     */
    abstract create(dbOptions: DBOptions, options: Options): Promise<void>;

    /**
     * Release resources occupied by the connection pool.
     *
     * @returns {Promise<void>}
     */
    abstract destroy(): Promise<void>;

    /**
     * Get free database connection. With this connection you
     * need to work as usual. i.e close it is also necessary
     *
     * @returns {Promise<D extends ADatabase<DBOptions, RS, S, T>>}
     */
    abstract get(): Promise<D>;
}