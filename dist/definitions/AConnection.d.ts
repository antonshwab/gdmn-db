import { AResultSet, CursorType } from "./AResultSet";
import { AStatement, INamedParams } from "./AStatement";
import { ATransaction, ITransactionOptions } from "./ATransaction";
import { IBaseExecuteOptions, TExecutor } from "./types";
export interface IConnectionOptions {
    host: string;
    port: number;
    username: string;
    password: string;
    path: string;
}
export interface IExecuteConnectionOptions<R> extends IBaseExecuteOptions<AConnection, R> {
    connection: AConnection;
    options: IConnectionOptions;
}
export interface IExecuteTransactionOptions<R> extends IBaseExecuteOptions<ATransaction, R> {
    connection: AConnection;
    options?: ITransactionOptions;
}
export interface IExecutePrepareStatementOptions<R> extends IBaseExecuteOptions<AStatement, R> {
    connection: AConnection;
    transaction: ATransaction;
    sql: string;
}
export interface IExecuteQueryResultSetOptions<R> extends IBaseExecuteOptions<AResultSet, R> {
    connection: AConnection;
    transaction: ATransaction;
    sql: string;
    params?: any[] | INamedParams;
    type?: CursorType;
}
export declare abstract class AConnection<Options extends IConnectionOptions = IConnectionOptions> {
    /**
     * Is the database connected.
     *
     * @returns {boolean}
     * true if the database connected;
     * false if the database was disconnected or not connected yet
     */
    abstract readonly connected: boolean;
    static executeSelf<Opt, R>(selfReceiver: TExecutor<null, AConnection>, callback: TExecutor<AConnection, R>): Promise<R>;
    static executeConnection<R>({ connection, callback, options }: IExecuteConnectionOptions<R>): Promise<R>;
    static executeTransaction<R>({ connection, callback, options }: IExecuteTransactionOptions<R>): Promise<R>;
    static executePrepareStatement<R>({ connection, transaction, callback, sql }: IExecutePrepareStatementOptions<R>): Promise<R>;
    static executeQueryResultSet<R>({ connection, transaction, callback, sql, params, type }: IExecuteQueryResultSetOptions<R>): Promise<R>;
    /**
     * Create database and connect absolute them.
     *
     * @param {Options} options
     * the type for creating database and connection absolute them
     */
    abstract createDatabase(options: Options): Promise<void>;
    /** Drop database and disconnect from them. */
    abstract dropDatabase(): Promise<void>;
    /**
     * Connect absolute the database.
     *
     * @param {Options} options
     * the type for opening database connection
     */
    abstract connect(options: Options): Promise<void>;
    /** Disconnect from the database. */
    abstract disconnect(): Promise<void>;
    /**
     * Start transaction.
     * @see {@link ATransaction.DEFAULT_OPTIONS}
     *
     * @param {ITransactionOptions} [options=DEFAULT_OPTIONS]
     * the type for transaction; optional
     * @returns {Promise<ATransaction>}
     * a Transaction object;
     * never null
     */
    abstract startTransaction(options?: ITransactionOptions): Promise<ATransaction>;
    /**
     * Creates a Statement object for sending parameterized SQL statements
     * absolute the database.
     *
     * @param {ATransaction} transaction
     * @param {string} sql
     * an SQL statement that may contain one or more parameter placeholders
     * @returns {Promise<AStatement>}
     * a Statement object containing the pre-compiled SQL statement
     */
    abstract prepare(transaction: ATransaction, sql: string): Promise<AStatement>;
    /**
     * Executes the SQL query and returns the ResultSet object generated by the query.
     *
     * @param {ATransaction} transaction
     * @param {string} sql
     * an SQL statement that may contain one or more parameter placeholders
     * @param {any[] | INamedParams} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     * @param {CursorType} type
     * @returns {Promise<AResultSet>}
     * a ResultSet object that contains the data produced by the given query;
     * never null
     */
    abstract executeQuery(transaction: ATransaction, sql: string, params?: any[] | INamedParams, type?: CursorType): Promise<AResultSet>;
    /**
     * Executes the SQL query.
     *
     * @param {ATransaction} transaction
     * @param {string} sql
     * an SQL statement that may contain one or more parameter placeholders
     * @param {any[] | INamedParams} params
     * array of parameters or object containing placeholders as keys and parameters as values; optional
     */
    abstract execute(transaction: ATransaction, sql: string, params?: any[] | INamedParams): Promise<void>;
}
