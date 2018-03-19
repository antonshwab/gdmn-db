import {ATransaction} from "./ATransaction";
import {AConnectionPool} from "./AConnectionPool";

export type Executor<Subject, Result> = ((subject: Subject) => Result) | ((subject: Subject) => Promise<Result>);

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
export abstract class ADatabase<Options, T extends ATransaction> {

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
    static async executeConnection<Opt,
        T extends ATransaction,
        DB extends ADatabase<Opt, T>,
        R>
    (
        database: DB,
        options: Opt,
        callback: Executor<DB, R>
    ): Promise<R> {
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
     * @param {DB} database
     * @param {Opt} options
     * @param {Executor<T extends ATransaction, R>} callback
     * @returns {Promise<R>}
     */
    static async executeTransaction<Opt,
        T extends ATransaction,
        DB extends ADatabase<Opt, T>,
        R>
    (
        database: DB,
        options: Opt,
        callback: Executor<T, R>
    ): Promise<R> {
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
     * @param {Pool} connectionPool
     * @param {Executor<DB extends ADatabase<Opt, T>, R>} callback
     * @returns {Promise<R>}
     */
    static async executeConnectionPool<Opt,
        T extends ATransaction,
        DB extends ADatabase<Opt, T>,
        Pool extends AConnectionPool<Opt, T, DB>,
        R>
    (
        connectionPool: Pool,
        callback: Executor<DB, R>
    ): Promise<R> {
        let database: DB;
        try {
            database = await connectionPool.attach();
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
     * @param {Pool} connectionPool
     * @param {Executor<T extends ATransaction, R>} callback
     * @returns {Promise<R>}
     */
    static async executeTransactionPool<Opt,
        T extends ATransaction,
        DB extends ADatabase<Opt, T>,
        Pool extends AConnectionPool<Opt, T, DB>,
        R>
    (
        connectionPool: Pool,
        callback: Executor<T, R>
    ): Promise<R> {
        return await ADatabase.executeConnectionPool(connectionPool, async (database) => {
            return await ATransaction.executeTransaction(await database.createTransaction(), callback);
        });
    }

    abstract async connect(options: Options): Promise<void>;

    abstract async disconnect(): Promise<void>;

    abstract async createTransaction(): Promise<T>;

    abstract async isConnected(): Promise<boolean>;
}