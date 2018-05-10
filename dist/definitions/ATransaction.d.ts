import { AConnection } from "./AConnection";
import { TExecutor } from "./types";
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
    isolation?: Isolation;
    accessMode?: AccessMode;
}
/**
 * The transaction object
 */
export declare abstract class ATransaction {
    static DEFAULT_OPTIONS: ITransactionOptions;
    protected readonly _connection: AConnection;
    protected readonly _options: ITransactionOptions;
    protected constructor(connection: AConnection, options?: ITransactionOptions);
    readonly connection: AConnection;
    /** Transaction type */
    readonly options: ITransactionOptions;
    /**
     * Indicates was the transaction will been started.
     *
     * @returns {boolean}
     * true if the transaction was commited or rollbacked
     */
    readonly abstract finished: boolean;
    static executeSelf<R>(selfReceiver: TExecutor<null, ATransaction>, callback: TExecutor<ATransaction, R>): Promise<R>;
    /** Commit the transaction. */
    abstract commit(): Promise<void>;
    /** Rollback the transaction. */
    abstract rollback(): Promise<void>;
}
