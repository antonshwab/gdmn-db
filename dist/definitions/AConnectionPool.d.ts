import { ADatabase, IDBOptions, TDatabase } from "./ADatabase";
import { AResultSet, TResultSet } from "./AResultSet";
import { AStatement, TStatement } from "./AStatement";
import { ATransaction, TTransaction } from "./ATransaction";
import { TExecutor } from "./types";
export declare type TConnectionPool<Opt> = AConnectionPool<Opt, IDBOptions, TResultSet, TStatement, TTransaction, TDatabase>;
export declare abstract class AConnectionPool<Options, DBOptions extends IDBOptions, RS extends AResultSet, S extends AStatement<RS>, T extends ATransaction<RS, S>, D extends ADatabase<DBOptions, RS, S, T>> {
    static executeFromParent<Opt, DBOpt, R>(sourceCallback: TExecutor<null, TConnectionPool<Opt>>, resultCallback: TExecutor<TConnectionPool<Opt>, R>): Promise<R>;
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
     * @param {IDBOptions} dbOptions
     * @param {Opt} options
     * @param {TExecutor<TConnectionPool<Opt>, R>} callback
     * @returns {Promise<R>}
     */
    static executeConnectionPool<Opt, R>(connectionPool: TConnectionPool<Opt>, dbOptions: IDBOptions, options: Opt, callback: TExecutor<TConnectionPool<Opt>, R>): Promise<R>;
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
    static executeDatabase<Opt, R>(connectionPool: TConnectionPool<Opt>, callback: TExecutor<TDatabase, R>): Promise<R>;
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
