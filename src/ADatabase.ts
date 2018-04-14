import {AResultSet} from "./AResultSet";
import {AStatement} from "./AStatement";
import {ATransaction, ITransactionOptions} from "./ATransaction";
import {TExecutor} from "./types";

export interface IDBOptions {
    host: string;
    port: number;
    username: string;
    password: string;
    path: string;
}

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
export abstract class ADatabase<Options extends IDBOptions = IDBOptions,
    RS extends AResultSet = AResultSet,
    S extends AStatement<RS> = AStatement<RS>,
    T extends ATransaction<RS, S> = ATransaction<RS, S>> {

    public static async executeFromParent<Opt, R>(sourceCallback: TExecutor<null, ADatabase>,
                                                  resultCallback: TExecutor<ADatabase, R>): Promise<R> {
        let database: undefined | ADatabase;
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
        database: ADatabase,
        options: IDBOptions,
        callback: TExecutor<ADatabase, R>
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
        database: ADatabase,
        callback: TExecutor<ATransaction, R>
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
        database: ADatabase,
        options: ITransactionOptions,
        callback: TExecutor<ATransaction, R>
    ): Promise<R>;

    public static async executeTransaction<R>(
        database: ADatabase,
        options: ITransactionOptions | TExecutor<ATransaction, R>,
        callback?: TExecutor<ATransaction, R>
    ): Promise<R> {
        if (!callback) {
            callback = options as TExecutor<ATransaction, R>;
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
