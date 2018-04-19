import { ABlob } from "./ABlob";
import { AResultSet } from "./AResultSet";
import { AStatement } from "./AStatement";
import { DBStructure } from "./DBStructure";
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
 * The transaction object
 */
export declare abstract class ATransaction<B extends ABlob = ABlob, RS extends AResultSet<B> = AResultSet<B>, S extends AStatement<B, RS> = AStatement<B, RS>> {
    static DEFAULT_OPTIONS: ITransactionOptions;
    protected _options: ITransactionOptions;
    protected constructor(options?: ITransactionOptions);
    static executeFromParent<R>(sourceCallback: TExecutor<null, ATransaction>, resultCallback: TExecutor<ATransaction, R>): Promise<R>;
    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executeStatement(transaction, "some sql with params", async (statement) => {
     *      await statement.execute([param1, param2]);
     *      await statement.execute([param3, param4]);
     *      return "some value";
     * })}
     * </pre>
     */
    static executeStatement<R>(transaction: ATransaction, sql: string, callback: TExecutor<AStatement, R>): Promise<R>;
    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executeResultSet(transaction, "some sql",
     *      async (resultSet) => {
     *          return await resultSet.getArrays();
     *      })
     * </pre>
     */
    static executeResultSet<R>(transaction: ATransaction, sql: string, callback: TExecutor<AResultSet, R>): Promise<R>;
    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executeResultSet(transaction, "some sql", [param1, param2],
     *      async (resultSet) => {
     *          return await resultSet.getArrays();
     *      })
     * </pre>
     */
    static executeResultSet<R>(transaction: ATransaction, sql: string, params: any[] | INamedParams, callback: TExecutor<AResultSet, R>): Promise<R>;
    /** Start the transaction. */
    abstract start(): Promise<void>;
    /** Commit the transaction. */
    abstract commit(): Promise<void>;
    /** Rollback the transaction. */
    abstract rollback(): Promise<void>;
    /**
     * Indicates was the transaction will been started.
     *
     * @returns {Promise<boolean>}
     * true if the transaction was started;
     * false if the transaction was commited, rollbacked or not started yet
     */
    abstract isActive(): Promise<boolean>;
    /**
     * Creates a Statement object for sending parameterized SQL statements
     * to the database.
     *
     * @param {string} sql
     * an SQL statement that may contain one or more parameter placeholders
     * @returns {Promise<S extends AStatement<RS>>}
     * a Statement object containing the pre-compiled SQL statement
     */
    abstract prepare(sql: string): Promise<S>;
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
    abstract executeQuery(sql: string, params?: any[] | INamedParams): Promise<RS>;
    /**
     * Executes the given SQL statement.
     *
     * @param {string} sql
     * an SQL statement to be sent to the database, typically a static SQL SELECT statement
     * @param {any[] | INamedParams | null} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     */
    abstract execute(sql: string, params?: any[] | INamedParams): Promise<void>;
    abstract readDBStructure(): Promise<DBStructure>;
}
