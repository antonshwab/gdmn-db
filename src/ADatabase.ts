import {ATransaction, TTransaction} from "./ATransaction";
import {AResultSet} from "./AResultSet";
import {TConnectionPool} from "./AConnectionPool";

export type TExecutor<Subject, Result> = ((subject: Subject) => Result) | ((subject: Subject) => Promise<Result>);

export type TDatabase<Opt> = ADatabase<Opt, AResultSet, TTransaction>;

/**
 * Example:
 * <pre><code>
 * (async () => {
 *      const database = new XXDatabase();
 *      try {
 *          const transaction = await database.createTransaction();
 *          try {
 *              await transaction.start();
 *
 *              await transaction.query("some sql");
 *
 *              await transaction.commit();
 *          } catch (error) {
 *              try {
 *                  await transaction.rollback();
 *              } catch (error) {
 *                  console.warn(error);
 *              }
 *              throw error;
 *          }
 *      } finally {
 *          try {
 *              await database.disconnect();
 *          } catch (err) {
 *              console.warn(err);
 *          }
 *      }
 * })()
 * </code></pre>
 */
export abstract class ADatabase<Options, RS extends AResultSet, T extends ATransaction<RS>> {

    /**
     * Example:
     * <pre>
     * const result = ADatabase.executeConnection(new XXDatabase(), {}, async (source) => {
     *      const transaction = await source.createTransaction();
     *      return await transaction.query("some sql");
     * })}
     * </pre>
     *
     * @param {TDatabase<Opt>} database
     * @param {Opt} options
     * @param {TExecutor<TDatabase<Opt>, R>} callback
     * @returns {Promise<R>}
     */
    static async executeConnection<Opt, R>(database: TDatabase<Opt>,
                                           options: Opt,
                                           callback: TExecutor<TDatabase<Opt>, R>): Promise<R> {
        try {
            await database.connect(options);
            return await callback(database);
        } finally {
            try {
                await database.disconnect();
            } catch (error) {
                console.warn(error);
            }
        }
    }

    /**
     * Example:
     * <pre>
     * const result = ADatabase.executeTransaction(new XXDatabase(), {}, async (transaction) => {
     *      return await transaction.query("some sql");
     * })}
     * </pre>
     *
     * @param {TDatabase<Opt>} database
     * @param {Opt} options
     * @param {TExecutor<TTransaction, R>} callback
     * @returns {Promise<R>}
     */
    static async executeTransaction<Opt, R>(database: TDatabase<Opt>,
                                            options: Opt,
                                            callback: TExecutor<TTransaction, R>): Promise<R> {
        return await ADatabase.executeConnection(database, options, async (database) => {
            return await ATransaction.executeTransaction(await database.createTransaction(), callback);
        });
    }

    /**
     * Example:
     * <pre>
     * const connectionPool = new XXConnectionPool();
     * connectionPool.create({});
     *
     * const result = ADatabase.executeConnectionPool(connectionPool, async (source) => {
     *      const transaction = await source.createTransaction();
     *      return await transaction.query("some sql");
     * })}
     *
     * connectionPool.destroy();
     * </pre>
     *
     * @param {TConnectionPool<Opt>} connectionPool
     * @param {TExecutor<TDatabase<Opt>, R>} callback
     * @returns {Promise<R>}
     */
    static async executeConnectionPool<Opt, R>(connectionPool: TConnectionPool<Opt>,
                                               callback: TExecutor<TDatabase<Opt>, R>): Promise<R> {
        let database: ADatabase<Opt, AResultSet, ATransaction<AResultSet>>;
        try {
            database = await connectionPool.get();
            return await callback(database);
        } finally {
            try {
                await database.disconnect();
            } catch (error) {
                console.warn(error);
            }
        }
    }

    /**
     * Example:
     * <pre>
     * const connectionPool = new XXConnectionPool();
     * connectionPool.create({});
     *
     * const result = ADatabase.executeTransactionPool(connectionPool, async (transaction) => {
     *      return await transaction.query("some sql");
     * })}
     *
     * connectionPool.destroy();
     * </pre>
     *
     * @param {TConnectionPool<Opt>} connectionPool
     * @param {TExecutor<TTransaction, R>} callback
     * @returns {Promise<R>}
     */
    static async executeTransactionPool<Opt, R>(connectionPool: TConnectionPool<Opt>,
                                                callback: TExecutor<TTransaction, R>): Promise<R> {
        return await ADatabase.executeConnectionPool(connectionPool, async (database) => {
            return await ATransaction.executeTransaction(await database.createTransaction(), callback);
        });
    }

    abstract async createDatabase(options: Options): Promise<void>;//TODO hide method for pool connection ???

    abstract async dropDatabase(): Promise<void>;//TODO hide method for pool connection ???

    abstract async connect(options: Options): Promise<void>;//TODO hide method for pool connection ???

    abstract async disconnect(): Promise<void>;

    abstract async createTransaction(): Promise<T>;

    abstract async isConnected(): Promise<boolean>;
}