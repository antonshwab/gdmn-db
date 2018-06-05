import { AConnection } from "./AConnection";
import { TExecutor } from "./types";
export declare enum AccessMode {
    READ_WRITE = "READ_WRITE",
    READ_ONLY = "READ_ONLY"
}
export declare enum Isolation {
    READ_COMMITED = "READ_COMMITED",
    READ_UNCOMMITED = "READ_UNCOMMITED",
    REPEATABLE_READ = "REPEATABLE_READ",
    SERIALIZABLE = "SERIALIZABLE"
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
    abstract readonly finished: boolean;
    static executeSelf<R>(selfReceiver: TExecutor<null, ATransaction>, callback: TExecutor<ATransaction, R>): Promise<R>;
    /** Commit the transaction. */
    abstract commit(): Promise<void>;
    /** Rollback the transaction. */
    abstract rollback(): Promise<void>;
}
