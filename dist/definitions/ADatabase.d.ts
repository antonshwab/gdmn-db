import { AResultSet, TResultSet } from "./AResultSet";
import { AStatement, TStatement } from "./AStatement";
import { ATransaction, ITransactionOptions, TTransaction } from "./ATransaction";
import { TExecutor } from "./types";
export interface IDBOptions {
    host: string;
    port: number;
    username: string;
    password: string;
    path: string;
}
export declare type TDatabase = ADatabase<IDBOptions, TResultSet, TStatement, TTransaction>;
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
 *              const resultSet = await transaction.executeQuery("some sql");
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
export declare abstract class ADatabase<Options extends IDBOptions, RS extends AResultSet, S extends AStatement<RS>, T extends ATransaction<RS, S>> {
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
     * @param {IDBOptions} options
     * @param {TExecutor<TDatabase, R>} callback
     * @returns {Promise<R>}
     */
    static executeConnection<R>(database: TDatabase, options: IDBOptions, callback: TExecutor<TDatabase, R>): Promise<R>;
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
     * @param {ITransactionOptions | null} options
     * @param {TExecutor<TTransaction, R>} callback
     * @returns {Promise<R>}
     */
    static executeTransaction<R>(database: TDatabase, options: null | ITransactionOptions, callback: TExecutor<TTransaction, R>): Promise<R>;
    abstract createDatabase(options: Options): Promise<void>;
    abstract dropDatabase(): Promise<void>;
    abstract connect(options: Options): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract createTransaction(options?: ITransactionOptions): Promise<T>;
    abstract isConnected(): Promise<boolean>;
}
