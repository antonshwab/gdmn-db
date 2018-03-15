import ATransaction from "./ATransaction";
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
export default abstract class DatabaseObj<Options, T extends ATransaction> {
    /**
     * Example:
     * <pre><code>
     * const result = ADatabase.executeConnection(new XXDatabase(), {}, async (database) => {
     *      const transaction = await database.createTransaction();
     *      return await transaction.query("some sql");
     * })}
     * </code></pre>
     *
     * @param {DB} database
     * @param {Opt} options
     * @param {Executor<DB extends DatabaseObj<Opt, T>, R>} callback
     * @returns {Promise<R>}
     */
    static executeConnection<Opt, T extends ATransaction, DB extends DatabaseObj<Opt, T>, R>(database: DB, options: Opt, callback: Executor<DB, R>): Promise<R>;
    /**
     * Example:
     * <pre><code>
     * const result2 = ADatabase.executeTransaction(new XXDatabase(), {}, async (transaction) => {
     *      return await transaction.query("some sql");
     * })}
     * </code></pre>
     *
     * @param {DB} database
     * @param {Opt} options
     * @param {Executor<T extends ATransaction, R>} callback
     * @returns {Promise<R>}
     */
    static executeTransaction<Opt, T extends ATransaction, DB extends DatabaseObj<Opt, T>, R>(database: DB, options: Opt, callback: Executor<T, R>): Promise<R>;
    abstract connect(options: Options): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract createTransaction(): Promise<T>;
    abstract isConnected(): Promise<boolean>;
}
