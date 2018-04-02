import {ADatabase, TDatabase} from "./ADatabase";
import {ATransaction, TTransaction} from "./ATransaction";
import {AResultSet, TResultSet} from "./AResultSet";
import {AStatement, TStatement} from "./AStatement";

export type TExecutor<Subject, Result> = ((subject: Subject) => Result) | ((subject: Subject) => Promise<Result>);

export type TConnectionPool<Opt, DBOpt> = AConnectionPool<Opt, DBOpt, TResultSet, TStatement, TTransaction,
    TDatabase<DBOpt>>;

export abstract class AConnectionPool<Options,
    DBOptions,
    RS extends AResultSet,
    S extends AStatement<RS>,
    T extends ATransaction<RS, S>,
    D extends ADatabase<DBOptions, RS, S, T>> {

    static async executeFromParent<Opt, DBOpt, R>(sourceCallback: TExecutor<null, TConnectionPool<Opt, DBOpt>>,
                                                  resultCallback: TExecutor<TConnectionPool<Opt, DBOpt>, R>): Promise<R> {
        let connectionPool: undefined | TConnectionPool<Opt, DBOpt>;
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
     * @param {TConnectionPool<Opt, DBOpt>} connectionPool
     * @param {DBOpt} dbOptions
     * @param {Opt} options
     * @param {TExecutor<TConnectionPool<Opt, DBOpt>, R>} callback
     * @returns {Promise<R>}
     */
    static async executeConnectionPool<Opt, DBOpt, R>(
        connectionPool: TConnectionPool<Opt, DBOpt>,
        dbOptions: DBOpt,
        options: Opt,
        callback: TExecutor<TConnectionPool<Opt, DBOpt>, R>
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
     * @param {TConnectionPool<Opt, DBOpt>} connectionPool
     * @param {TExecutor<TDatabase<DBOpt>, R>} callback
     * @returns {Promise<R>}
     */
    static async executeDatabase<Opt, DBOpt, R>(
        connectionPool: TConnectionPool<Opt, DBOpt>,
        callback: TExecutor<TDatabase<DBOpt>, R>
    ): Promise<R> {
        return await ADatabase.executeFromParent(() => connectionPool.get(), callback);
    }

    abstract isCreated(): Promise<boolean>;

    abstract create(dbOptions: DBOptions, options: Options): Promise<void>;

    abstract destroy(): Promise<void>;

    abstract get(): Promise<D>;
}