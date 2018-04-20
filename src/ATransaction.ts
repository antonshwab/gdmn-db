import {ABlob} from "./ABlob";
import {AResultSet} from "./AResultSet";
import {AStatement} from "./AStatement";
import {TExecutor} from "./types";

export interface INamedParams {
    [paramName: string]: any;
}

export enum AccessMode {
    READ_WRITE, READ_ONLY
}

export enum Isolation {
    READ_COMMITED,
    READ_UNCOMMITED,
    REPEATABLE_READ,
    SERIALIZABLE
}

export interface ITransactionOptions {
    isolation: Isolation;
    accessMode: AccessMode;
}

/**
 * The transaction object
 */
export abstract class ATransaction<B extends ABlob = ABlob,
    RS extends AResultSet<B> = AResultSet<B>,
    S extends AStatement<B, RS> = AStatement<B, RS>> {

    public static DEFAULT_OPTIONS: ITransactionOptions = {
        isolation: Isolation.READ_COMMITED,
        accessMode: AccessMode.READ_WRITE
    };
    protected _options: ITransactionOptions;

    protected constructor(options: ITransactionOptions = ATransaction.DEFAULT_OPTIONS) {
        this._options = options;
    }

    public static async executeSelf<R>(selfReceiver: TExecutor<null, ATransaction>,
                                       callback: TExecutor<ATransaction, R>): Promise<R> {
        let self: undefined | ATransaction;
        try {
            self = await selfReceiver(null);
            const result = await callback(self);
            await self.commit();
            return result;
        } catch (error) {
            if (self) {
                await self.rollback();
            }
            throw error;
        }
    }

    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executePrepareStatement(transaction, "some sql with params",
     *      async (statement) => {
     *          await statement.execute([param1, param2]);
     *          await statement.execute([param3, param4]);
     *          return "some value";
     *      })}
     * </pre>
     */
    public static async executePrepareStatement<R>(
        transaction: ATransaction,
        sql: string,
        callback: TExecutor<AStatement, R>
    ): Promise<R> {
        return await AStatement.executeSelf(() => transaction.prepare(sql), callback);
    }

    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executeQueryResultSet(transaction, "some sql",
     *      async (resultSet) => {
     *          return await resultSet.getArrays();
     *      })
     * </pre>
     */
    public static async executeQueryResultSet<R>(
        transaction: ATransaction,
        sql: string,
        callback: TExecutor<AResultSet, R>
    ): Promise<R>;

    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executeQueryResultSet(transaction, "some sql", [param1, param2],
     *      async (resultSet) => {
     *          return await resultSet.getArrays();
     *      })
     * </pre>
     */
    public static async executeQueryResultSet<R>(
        transaction: ATransaction,
        sql: string,
        params: any[] | INamedParams,
        callback: TExecutor<AResultSet, R>
    ): Promise<R>;

    public static async executeQueryResultSet<R>(
        transaction: ATransaction,
        sql: string,
        params: any[] | INamedParams,
        callback?: TExecutor<AResultSet, R>
    ): Promise<R> {
        if (!callback) {
            callback = params as TExecutor<AResultSet, R>;
        }
        return await AResultSet.executeSelf(() => transaction.executeQuery(sql, params), callback);
    }

    /** Start the transaction. */
    public abstract async start(): Promise<void>;

    /** Commit the transaction. */
    public abstract async commit(): Promise<void>;

    /** Rollback the transaction. */
    public abstract async rollback(): Promise<void>;

    /**
     * Indicates was the transaction will been started.
     *
     * @returns {Promise<boolean>}
     * true if the transaction was started;
     * false if the transaction was commited, rollbacked or not started yet
     */
    public abstract async isActive(): Promise<boolean>;

    /**
     * Creates a Statement object for sending parameterized SQL statements
     * to the database.
     *
     * @param {string} sql
     * an SQL statement that may contain one or more parameter placeholders
     * @returns {Promise<S extends AStatement<RS>>}
     * a Statement object containing the pre-compiled SQL statement
     */
    public abstract async prepare(sql: string): Promise<S>;

    /**
     * Executes the given SQL statement, which returns a ResultSet object.
     *
     * @param {string} sql
     * an SQL statement to be sent to the database, typically a static SQL SELECT statement
     * @param {any[] | INamedParams | null} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     * @returns {Promise<RS extends AResultSet>}
     * a ResultSet object that contains the data produced by the given query;
     * never null
     */
    public abstract async executeQuery(sql: string, params?: any[] | INamedParams): Promise<RS>;

    /**
     * Executes the given SQL statement.
     *
     * @param {string} sql
     * an SQL statement to be sent to the database, typically a static SQL SELECT statement
     * @param {any[] | INamedParams | null} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     */
    public abstract async execute(sql: string, params?: any[] | INamedParams): Promise<void>;
}
