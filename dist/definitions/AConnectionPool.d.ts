import { TExecutor } from "./types";
import { ADatabase, TDatabase, TDBOptions } from "./ADatabase";
import { ATransaction, TTransaction } from "./ATransaction";
import { AResultSet, TResultSet } from "./AResultSet";
import { AStatement, TStatement } from "./AStatement";
export declare type TConnectionPool<Opt> = AConnectionPool<Opt, TDBOptions, TResultSet, TStatement, TTransaction, TDatabase>;
export declare abstract class AConnectionPool<Options, DBOptions extends TDBOptions, RS extends AResultSet, S extends AStatement<RS>, T extends ATransaction<RS, S>, D extends ADatabase<DBOptions, RS, S, T>> {
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
     * @param {TDBOptions} dbOptions
     * @param {Opt} options
     * @param {TExecutor<TConnectionPool<Opt>, R>} callback
     * @returns {Promise<R>}
     */
    static executeConnectionPool<Opt, R>(connectionPool: TConnectionPool<Opt>, dbOptions: TDBOptions, options: Opt, callback: TExecutor<TConnectionPool<Opt>, R>): Promise<R>;
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
    abstract isCreated(): Promise<boolean>;
    abstract create(dbOptions: DBOptions, options: Options): Promise<void>;
    abstract destroy(): Promise<void>;
    abstract get(): Promise<D>;
}
