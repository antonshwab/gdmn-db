import {AResultSet} from "./AResultSet";
import {AStatement} from "./AStatement";
import {ATransaction, ITransactionOptions} from "./ATransaction";
import {TExecutor} from "./types";

export interface IConnectionOptions {
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
 *      const connection = Factory.XXModule.newConnection();
 *      try {
 *          await connection.connect({...});
 *
 *          const transaction = await connection.createTransaction();
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
 *              await connection.disconnect();
 *          } catch (err) {
 *              console.warn(err);
 *          }
 *      }
 * })()
 * </pre>
 */
export abstract class AConnection<Options extends IConnectionOptions = IConnectionOptions,
    RS extends AResultSet = AResultSet,
    S extends AStatement<RS> = AStatement<RS>,
    T extends ATransaction<RS, S> = ATransaction<RS, S>> {

    public static async executeFromParent<Opt, R>(sourceCallback: TExecutor<null, AConnection>,
                                                  resultCallback: TExecutor<AConnection, R>): Promise<R> {
        let connection: undefined | AConnection;
        try {
            connection = await sourceCallback(null);
            return await resultCallback(connection);
        } finally {
            if (connection) {
                await connection.disconnect();
            }
        }
    }

    /**
     * Example:
     * <pre>
     * const result = await AConnection.executeConnection(Factory.XXModule.newConnection()), {}, async (source) => {
     *      return await AConnection.executeTransaction(transaction, {}, async (transaction) => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    public static async executeConnection<R>(
        connection: AConnection,
        options: IConnectionOptions,
        callback: TExecutor<AConnection, R>
    ): Promise<R> {
        return await AConnection.executeFromParent(async () => {
            await connection.connect(options);
            return connection;
        }, callback);
    }

    /**
     * Example:
     * <pre>
     * const result = await AConnection.executeTransaction(connection, async transaction => {
     *      return await transaction.executeStatement("some sql", async statement => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    public static async executeTransaction<R>(
        connection: AConnection,
        callback: TExecutor<ATransaction, R>
    ): Promise<R>;

    /**
     * Example:
     * <pre>
     * const result = await AConnection.executeTransaction(connection, {}, async transaction => {
     *      return await transaction.executeStatement("some sql", async statement => {
     *          return ...
     *      });
     * })}
     * </pre>
     */
    public static async executeTransaction<R>(
        connection: AConnection,
        options: ITransactionOptions,
        callback: TExecutor<ATransaction, R>
    ): Promise<R>;

    public static async executeTransaction<R>(
        connection: AConnection,
        options: ITransactionOptions | TExecutor<ATransaction, R>,
        callback?: TExecutor<ATransaction, R>
    ): Promise<R> {
        if (!callback) {
            callback = options as TExecutor<ATransaction, R>;
        }
        return await ATransaction.executeFromParent(async () => {
            const transaction = await connection.createTransaction(options as ITransactionOptions);
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
