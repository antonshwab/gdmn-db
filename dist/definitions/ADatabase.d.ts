import { ATransaction } from "./ATransaction";
import { AResultSet } from "./AResultSet";
import { AConnectionPool } from "./AConnectionPool";
export declare type Executor<Subject, Result> = ((subject: Subject) => Result) | ((subject: Subject) => Promise<Result>);
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
     * @param {DB} database
     * @param {Opt} options
     * @param {Executor<DB extends ADatabase<Opt, T>, R>} callback
     * @returns {Promise<R>}
     */
    static executeConnection<Opt, RS extends AResultSet, T extends ATransaction<RS>, DB extends ADatabase<Opt, RS, T>, R>(database: DB, options: Opt, callback: Executor<DB, R>): Promise<R>;
    /**
     * Example:
     * <pre>
     * const result = ADatabase.executeTransaction(new XXDatabase(), {}, async (transaction) => {
     *      return await transaction.query("some sql");
     * })}
     * </pre>
     *
     * @param {DB} database
     * @param {Opt} options
     * @param {Executor<T extends ATransaction, R>} callback
     * @returns {Promise<R>}
     */
    static executeTransaction<Opt, RS extends AResultSet, T extends ATransaction<RS>, DB extends ADatabase<Opt, RS, T>, R>(database: DB, options: Opt, callback: Executor<T, R>): Promise<R>;
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
     * @param {Pool} connectionPool
     * @param {Executor<DB extends ADatabase<Opt, T>, R>} callback
     * @returns {Promise<R>}
     */
    static executeConnectionPool<Opt, RS extends AResultSet, T extends ATransaction<RS>, DB extends ADatabase<Opt, RS, T>, Pool extends AConnectionPool<Opt, RS, T, DB>, R>(connectionPool: Pool, callback: Executor<DB, R>): Promise<R>;
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
     * @param {Pool} connectionPool
     * @param {Executor<T extends ATransaction, R>} callback
     * @returns {Promise<R>}
     */
    static executeTransactionPool<Opt, RS extends AResultSet, T extends ATransaction<RS>, DB extends ADatabase<Opt, RS, T>, Pool extends AConnectionPool<Opt, RS, T, DB>, R>(connectionPool: Pool, callback: Executor<T, R>): Promise<R>;
    abstract connect(options: Options): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract createTransaction(): Promise<T>;
    abstract isConnected(): Promise<boolean>;
}
