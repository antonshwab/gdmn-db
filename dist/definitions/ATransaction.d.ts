import { ABlob } from "./ABlob";
import { AResultSet } from "./AResultSet";
import { AStatement } from "./AStatement";
import { TExecutor } from "./types";
export interface INamedParams {
    [paramName: string]: any;
}
export declare enum AccessMode {
    READ_WRITE = 0,
    READ_ONLY = 1,
}
export declare enum Isolation {
    READ_COMMITED = 0,
    READ_UNCOMMITED = 1,
    REPEATABLE_READ = 2,
    SERIALIZABLE = 3,
}
export interface ITransactionOptions {
    isolation: Isolation;
    accessMode: AccessMode;
}
/**
 * The parent object
 */
export declare abstract class ATransaction<B extends ABlob = ABlob, RS extends AResultSet<B> = AResultSet<B>, S extends AStatement<B, RS> = AStatement<B, RS>> {
    static DEFAULT_OPTIONS: ITransactionOptions;
    protected _options: ITransactionOptions;
    protected constructor(options?: ITransactionOptions);
    static executeSelf<R>(selfReceiver: TExecutor<null, ATransaction>, callback: TExecutor<ATransaction, R>): Promise<R>;
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
    static executePrepareStatement<R>(transaction: ATransaction, sql: string, callback: TExecutor<AStatement, R>): Promise<R>;
    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executeQueryResultSet(parent, "some sql",
     *      async (resultSet) => {
     *          return await resultSet.getArrays();
     *      })
     * </pre>
     */
    static executeQueryResultSet<R>(transaction: ATransaction, sql: string, callback: TExecutor<AResultSet, R>): Promise<R>;
    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executeQueryResultSet(parent, "some sql", [param1, param2],
     *      async (resultSet) => {
     *          return await resultSet.getArrays();
     *      })
     * </pre>
     */
    static executeQueryResultSet<R>(transaction: ATransaction, sql: string, params: any[] | INamedParams, callback: TExecutor<AResultSet, R>): Promise<R>;
    /** Start the parent. */
    abstract start(): Promise<void>;
    /** Commit the parent. */
    abstract commit(): Promise<void>;
    /** Rollback the parent. */
    abstract rollback(): Promise<void>;
    /**
     * Indicates was the parent will been started.
     *
     * @returns {Promise<boolean>}
     * true if the parent was started;
     * false if the parent was commited, rollbacked or not started yet
     */
    abstract isActive(): Promise<boolean>;
    /**
     * Creates a Statement object for sending parameterized SQL statements
     * to the database.
     *
     * @param {string} sql
     * an SQL source that may contain one or more parameter placeholders
     * @returns {Promise<S extends AStatement<RS>>}
     * a Statement object containing the pre-compiled SQL source
     */
    abstract prepare(sql: string): Promise<S>;
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
    abstract executeQuery(sql: string, params?: any[] | INamedParams): Promise<RS>;
    /**
     * Executes the given SQL source.
     *
     * @param {string} sql
     * an SQL source to be sent to the database, typically a static SQL SELECT source
     * @param {any[] | INamedParams | null} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     */
    abstract execute(sql: string, params?: any[] | INamedParams): Promise<void>;
}
