import { ADatabase, IDBOptions } from "./ADatabase";
import { AResultSet } from "./AResultSet";
import { AStatement } from "./AStatement";
import { ATransaction } from "./ATransaction";
import { TExecutor } from "./types";
export declare abstract class AConnectionPool<Options, DBOptions extends IDBOptions = IDBOptions, RS extends AResultSet = AResultSet, S extends AStatement<RS> = AStatement<RS>, T extends ATransaction<RS, S> = ATransaction<RS, S>, D extends ADatabase<DBOptions, RS, S, T> = ADatabase<DBOptions, RS, S, T>> {
    static executeFromParent<Opt, DBOpt, R>(sourceCallback: TExecutor<null, AConnectionPool<Opt>>, resultCallback: TExecutor<AConnectionPool<Opt>, R>): Promise<R>;
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
    static executeConnectionPool<Opt, R>(connectionPool: AConnectionPool<Opt>, dbOptions: IDBOptions, options: Opt, callback: TExecutor<AConnectionPool<Opt>, R>): Promise<R>;
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
    static executeDatabase<Opt, R>(connectionPool: AConnectionPool<Opt>, callback: TExecutor<ADatabase, R>): Promise<R>;
    /**
     * Is the connection pool prepared?
     *
     * @returns {Promise<boolean>}
     * true if the connection pool created;
     * false if the connection pool destroyed or not created
     */
    abstract isCreated(): Promise<boolean>;
    /**
     * Prepare the connection pool for use with some database.
     * After work you need to call {@link AConnectionPool.destroy()} method.
     *
     * @param {DBOptions} dbOptions
     * the options for opening database connection
     * @param {Options} options
     * the options for creating connection pool
     */
    abstract create(dbOptions: DBOptions, options: Options): Promise<void>;
    /** Release resources occupied by the connection pool. */
    abstract destroy(): Promise<void>;
    /**
     * Get free database connection. With this connection you
     * need to work as usual. i.e close it is also necessary
     *
     * @returns {Promise<D extends ADatabase<DBOptions, RS, S, T>>}
     * the database connection
     */
    abstract get(): Promise<D>;
}
