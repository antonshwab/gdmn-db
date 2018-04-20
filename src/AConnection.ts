import {ABlob} from "./ABlob";
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
    B extends ABlob = ABlob,
    RS extends AResultSet<B> = AResultSet<B>,
    S extends AStatement<B, RS> = AStatement<B, RS>,
    T extends ATransaction<B, RS, S> = ATransaction<B, RS, S>> {

    public static async executeSelf<Opt, R>(selfReceiver: TExecutor<null, AConnection>,
                                            callback: TExecutor<AConnection, R>): Promise<R> {
        let self: undefined | AConnection;
        try {
            self = await selfReceiver(null);
            return await callback(self);
        } finally {
            if (self) {
                await self.disconnect();
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
        return await AConnection.executeSelf(async () => {
            await connection.connect(options);
            return connection;
        }, callback);
    }

    /**
     * Example:
     * <pre>
     * const result = await AConnection.executeTransaction(connection, async transaction => {
     *      return await transaction.executePrepareStatement("some sql", async statement => {
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
     *      return await transaction.executePrepareStatement("some sql", async statement => {
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
        return await ATransaction.executeSelf(async () => {
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
