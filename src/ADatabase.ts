import {AResultSet, TResultSet} from "./AResultSet";
import {AStatement, TStatement} from "./AStatement";
import {ATransaction, ITransactionOptions, TTransaction} from "./ATransaction";
import {TExecutor} from "./types";

export interface IDBOptions {
    host: string;
    port: number;
    username: string;
    password: string;
    path: string;
}

/**
 * Simplified type of {@link ADatabase}
 */
export type TDatabase = ADatabase<IDBOptions, TResultSet, TStatement, TTransaction>;

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
export abstract class ADatabase<Options extends IDBOptions,
    RS extends AResultSet,
    S extends AStatement<RS>,
    T extends ATransaction<RS, S>> {

    public static async executeFromParent<Opt, R>(sourceCallback: TExecutor<null, TDatabase>,
                                                  resultCallback: TExecutor<TDatabase, R>): Promise<R> {
        let database: undefined | TDatabase;
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
     */
    public static async executeConnection<R>(
        database: TDatabase,
        options: IDBOptions,
        callback: TExecutor<TDatabase, R>
    ): Promise<R> {
        return await ADatabase.executeFromParent(async () => {
            await database.connect(options);
            return database;
        }, callback);
    }

    /**
     * Example:
     * <pre>
     * const result = await ADatabase.executeTransaction(database, async transaction => {
     *      return await transaction.executeStatement("some sql", async statement => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    public static async executeTransaction<R>(
        database: TDatabase,
        callback: TExecutor<TTransaction, R>
    ): Promise<R>;

    /**
     * Example:
     * <pre>
     * const result = await ADatabase.executeTransaction(database, {}, async transaction => {
     *      return await transaction.executeStatement("some sql", async statement => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    public static async executeTransaction<R>(
        database: TDatabase,
        options: ITransactionOptions,
        callback: TExecutor<TTransaction, R>
    ): Promise<R>;

    public static async executeTransaction<R>(
        database: TDatabase,
        options: ITransactionOptions | TExecutor<TTransaction, R>,
        callback?: TExecutor<TTransaction, R>
    ): Promise<R> {
        if (!callback) {
            callback = options as TExecutor<TTransaction, R>;
        }
        return await ATransaction.executeFromParent(async () => {
            const transaction = await database.createTransaction(options as ITransactionOptions);
            await transaction.start();
            return transaction;
        }, callback);
    }

    /**
     * Create database and connect to them.
     *
     * @param {Options} options
     * the options for creating database and connection to them
     */
    public abstract async createDatabase(options: Options): Promise<void>;

    /** Drop database and disconnect from them. */
    public abstract async dropDatabase(): Promise<void>;

    /**
     * Connect to the database.
     *
     * @param {Options} options
     * the options for opening database connection
     */
    public abstract async connect(options: Options): Promise<void>;

    /** Disconnect from the database. */
    public abstract async disconnect(): Promise<void>;

    /**
     * Create transaction.
     * @see {@link ATransaction.DEFAULT_OPTIONS}
     *
     * @param {ITransactionOptions} [options=DEFAULT_OPTIONS]
     * the options for transaction; optional
     * @returns {Promise<T extends ATransaction<RS, S>>}
     * a Transaction object;
     * never null
     */
    public abstract async createTransaction(options?: ITransactionOptions): Promise<T>;

    /**
     * Is the database connected.
     *
     * @returns {Promise<boolean>}
     * true if the database connected;
     * false if the database was disconnected or not connected yet
     */
    public abstract async isConnected(): Promise<boolean>;
}
