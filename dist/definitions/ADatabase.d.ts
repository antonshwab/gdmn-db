import { ATransaction, TTransaction } from "./ATransaction";
import { AResultSet } from "./AResultSet";
import { TConnectionPool } from "./AConnectionPool";
export declare type TExecutor<Subject, Result> = ((subject: Subject) => Result) | ((subject: Subject) => Promise<Result>);
export declare type TDatabase<Opt> = ADatabase<Opt, AResultSet, TTransaction>;
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
export declare abstract class ADatabase<Options, RS extends AResultSet, T extends ATransaction<RS>> {
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
    static executeConnection<Opt, R>(database: TDatabase<Opt>, options: Opt, callback: TExecutor<TDatabase<Opt>, R>): Promise<R>;
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
    static executeTransaction<Opt, R>(database: TDatabase<Opt>, options: Opt, callback: TExecutor<TTransaction, R>): Promise<R>;
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
     * @param {TConnectionPool<Opt, DBOptions>} connectionPool
     * @param {TExecutor<TDatabase<DBOptions>, R>} callback
     * @returns {Promise<R>}
     */
    static executeConnectionPool<Opt, DBOptions, R>(connectionPool: TConnectionPool<Opt, DBOptions>, callback: TExecutor<TDatabase<DBOptions>, R>): Promise<R>;
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
     * @param {TConnectionPool<Opt, DBOptions>} connectionPool
     * @param {TExecutor<TTransaction, R>} callback
     * @returns {Promise<R>}
     */
    static executeTransactionPool<Opt, DBOptions, R>(connectionPool: TConnectionPool<Opt, DBOptions>, callback: TExecutor<TTransaction, R>): Promise<R>;
    abstract createDatabase(options: Options): Promise<void>;
    abstract dropDatabase(): Promise<void>;
    abstract connect(options: Options): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract createTransaction(): Promise<T>;
    abstract isConnected(): Promise<boolean>;
}
