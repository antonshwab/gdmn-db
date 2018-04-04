import { TExecutor } from "./types";
import { ATransaction, TTransaction } from "./ATransaction";
import { AStatement, TStatement } from "./AStatement";
import { AResultSet, TResultSet } from "./AResultSet";
export declare type TDatabase<Opt> = ADatabase<Opt, TResultSet, TStatement, TTransaction>;
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
export declare abstract class ADatabase<Options, RS extends AResultSet, S extends AStatement<RS>, T extends ATransaction<RS, S>> {
    static executeFromParent<Opt, R>(sourceCallback: TExecutor<null, TDatabase<Opt>>, resultCallback: TExecutor<TDatabase<Opt>, R>): Promise<R>;
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
    static executeConnection<Opt, R>(database: TDatabase<Opt>, options: Opt, callback: TExecutor<TDatabase<Opt>, R>): Promise<R>;
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
    static executeTransaction<Opt, R>(database: TDatabase<Opt>, callback: TExecutor<TTransaction, R>): Promise<R>;
    abstract createDatabase(options: Options): Promise<void>;
    abstract dropDatabase(): Promise<void>;
    abstract connect(options: Options): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract createTransaction(): Promise<T>;
    abstract isConnected(): Promise<boolean>;
}
