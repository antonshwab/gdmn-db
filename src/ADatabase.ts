import {TExecutor} from "./AConnectionPool";
import {ATransaction, TTransaction} from "./ATransaction";
import {AStatement, TStatement} from "./AStatement";
import {AResultSet, TResultSet} from "./AResultSet";

export type TDatabase<Opt> = ADatabase<Opt, TResultSet, TStatement, TTransaction>;

/**
 * Example:
 * <pre>
 * (async () => {
 *      const database = Factory.XXModule.newDatabase();
 *      try {
 *          await database.connect({...});
 *
 *          const transaction = await database.createTransaction();
 *          try {
 *              await transaction.start();
 *
 *              const resultSet = await transaction.executeSQL("some sql");
 *              await resultSet.getArrays();
 *              await resultSet.close();
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
 * </pre>
 */
export abstract class ADatabase<Options,
    RS extends AResultSet,
    S extends AStatement<RS>,
    T extends ATransaction<RS, S>> {

    static async executeFromParent<Opt, R>(sourceCallback: TExecutor<null, TDatabase<Opt>>,
                                           resultCallback: TExecutor<TDatabase<Opt>, R>): Promise<R> {
        let database: undefined | TDatabase<Opt>;
        try {
            database = await sourceCallback(null);
            return await resultCallback(database);
        } finally {
            if (database) {
                await database.disconnect();
            }
        }
    }

    /**
     * Example:
     * <pre>
     * const result = await ADatabase.executeConnection(Factory.XXModule.newDatabase()), {}, async (source) => {
     *      return await ADatabase.executeTransaction(transaction, {}, async (transaction) => {
     *          return ...
     *      });
     * })}
     * </pre>
     *
     * @param {TDatabase<Opt>} database
     * @param {Opt} options
     * @param {TExecutor<TDatabase<Opt>, R>} callback
     * @returns {Promise<R>}
     */
    static async executeConnection<Opt, R>(
        database: TDatabase<Opt>,
        options: Opt,
        callback: TExecutor<TDatabase<Opt>, R>
    ): Promise<R> {
        return await ADatabase.executeFromParent(async () => {
            await database.connect(options);
            return database;
        }, callback);
    }

    /**
     * Example:
     * <pre>
     * const result = await ADatabase.executeTransaction(database, {}, async transaction => {
     *      return await transaction.executeStatement("some sql", async statement => {
     *          return ...
     *      });
     * })}
     * </pre>
     *
     * @param {TDatabase<Opt>} database
     * @param {TExecutor<TTransaction, R>} callback
     * @returns {Promise<R>}
     */
    static async executeTransaction<Opt, R>(
        database: TDatabase<Opt>,
        callback: TExecutor<TTransaction, R>
    ): Promise<R> {
        return await ATransaction.executeFromParent(async () => {
            const transaction = await database.createTransaction();
            await transaction.start();
            return transaction;
        }, callback);
    }

    abstract async createDatabase(options: Options): Promise<void>;

    abstract async dropDatabase(): Promise<void>;

    abstract async connect(options: Options): Promise<void>;

    abstract async disconnect(): Promise<void>;

    abstract async createTransaction(): Promise<T>;

    abstract async isConnected(): Promise<boolean>;
}