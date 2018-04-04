import { TExecutor } from "./types";
import { ATransaction, TTransaction } from "./ATransaction";
import { AStatement, TStatement } from "./AStatement";
import { AResultSet, TResultSet } from "./AResultSet";
export declare type TDBOptions = {
    host: string;
    port: number;
    username: string;
    password: string;
    path: string;
};
export declare type TDatabase = ADatabase<TDBOptions, TResultSet, TStatement, TTransaction>;
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
export declare abstract class ADatabase<Options extends TDBOptions, RS extends AResultSet, S extends AStatement<RS>, T extends ATransaction<RS, S>> {
    static executeFromParent<Opt, R>(sourceCallback: TExecutor<null, TDatabase>, resultCallback: TExecutor<TDatabase, R>): Promise<R>;
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
     * @param {TDatabase} database
     * @param {TDBOptions} options
     * @param {TExecutor<TDatabase, R>} callback
     * @returns {Promise<R>}
     */
    static executeConnection<R>(database: TDatabase, options: TDBOptions, callback: TExecutor<TDatabase, R>): Promise<R>;
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
     * @param {TDatabase} database
     * @param {TExecutor<TTransaction, R>} callback
     * @returns {Promise<R>}
     */
    static executeTransaction<R>(database: TDatabase, callback: TExecutor<TTransaction, R>): Promise<R>;
    abstract createDatabase(options: Options): Promise<void>;
    abstract dropDatabase(): Promise<void>;
    abstract connect(options: Options): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract createTransaction(): Promise<T>;
    abstract isConnected(): Promise<boolean>;
}
