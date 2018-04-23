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
 * The parent object
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
     * const result = await ATransaction.executePrepareStatement(parent, "some sql with params",
     *      async (source) => {
     *          await source.execute([param1, param2]);
     *          await source.execute([param3, param4]);
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
     * const result = await ATransaction.executeQueryResultSet(parent, "some sql",
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
     * const result = await ATransaction.executeQueryResultSet(parent, "some sql", [param1, param2],
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

    /** Start the parent. */
    public abstract async start(): Promise<void>;

    /** Commit the parent. */
    public abstract async commit(): Promise<void>;

    /** Rollback the parent. */
    public abstract async rollback(): Promise<void>;

    /**
     * Indicates was the parent will been started.
     *
     * @returns {Promise<boolean>}
     * true if the parent was started;
     * false if the parent was commited, rollbacked or not started yet
     */
    public abstract async isActive(): Promise<boolean>;

    /**
     * Creates a Statement object for sending parameterized SQL statements
     * to the database.
     *
     * @param {string} sql
     * an SQL source that may contain one or more parameter placeholders
     * @returns {Promise<S extends AStatement<RS>>}
     * a Statement object containing the pre-compiled SQL source
     */
    public abstract async prepare(sql: string): Promise<S>;

    /**
     * Executes the given SQL source, which returns a ResultSet object.
     *
     * @param {string} sql
     * an SQL source to be sent to the database, typically a static SQL SELECT source
     * @param {any[] | INamedParams | null} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     * @returns {Promise<RS extends AResultSet>}
     * a ResultSet object that contains the data produced by the given query;
     * never null
     */
    public abstract async executeQuery(sql: string, params?: any[] | INamedParams): Promise<RS>;

    /**
     * Executes the given SQL source.
     *
     * @param {string} sql
     * an SQL source to be sent to the database, typically a static SQL SELECT source
     * @param {any[] | INamedParams | null} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     */
    public abstract async execute(sql: string, params?: any[] | INamedParams): Promise<void>;
}
