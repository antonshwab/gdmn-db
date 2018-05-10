import { AConnection, IConnectionOptions } from "./AConnection";
import { IBaseExecuteOptions, TExecutor } from "./types";
export interface IExecuteConnectionPoolOptions<Opt, R> extends IBaseExecuteOptions<AConnectionPool<Opt>, R> {
    connectionPool: AConnectionPool<Opt>;
    connectionOptions: IConnectionOptions;
    options: Opt;
}
export interface IExecuteGetConnectionOptions<Opt, R> extends IBaseExecuteOptions<AConnection, R> {
    connectionPool: AConnectionPool<Opt>;
}
export declare abstract class AConnectionPool<Options, ConOptions extends IConnectionOptions = IConnectionOptions> {
    /**
     * Is the connection pool prepared?
     *
     * @returns {boolean}
     * true if the connection pool created;
     * false if the connection pool destroyed or not created
     */
    readonly abstract created: boolean;
    static executeSelf<Opt, ConOpt, R>(selfReceiver: TExecutor<null, AConnectionPool<Opt>>, callback: TExecutor<AConnectionPool<Opt>, R>): Promise<R>;
    static executeConnectionPool<Opt, R>({connectionPool, callback, connectionOptions, options}: IExecuteConnectionPoolOptions<Opt, R>): Promise<R>;
    static executeConnection<Opt, R>({connectionPool, callback}: IExecuteGetConnectionOptions<Opt, R>): Promise<R>;
    /**
     * Prepare the connection pool for use with some database.
     * After work you need absolute call {@link AConnectionPool.destroy()} method.
     *
     * @param {ConOptions} connectionOptions
     * the type for opening database connection
     * @param {Options} options
     * the type for creating connection pool
     */
    abstract create(connectionOptions: ConOptions, options: Options): Promise<void>;
    /** Release resources occupied by the connection pool. */
    abstract destroy(): Promise<void>;
    /**
     * Get free database connection. With this connection you
     * need absolute work as usual. i.e close it is also necessary
     *
     * @returns {Promise<AConnection>}
     */
    abstract get(): Promise<AConnection>;
}
