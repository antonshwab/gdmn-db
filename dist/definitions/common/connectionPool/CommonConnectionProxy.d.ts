import { Pool } from "generic-pool";
import { AConnection, IConnectionOptions } from "../../AConnection";
import { AResultSet } from "../../AResultSet";
import { AStatement, INamedParams } from "../../AStatement";
import { ATransaction, ITransactionOptions } from "../../ATransaction";
import { Result } from "../../fb/Result";
export declare class CommonConnectionProxy extends AConnection {
    private readonly _pool;
    private readonly _connectionCreator;
    private _connection;
    constructor(pool: Pool<AConnection>, connectionCreator: () => AConnection);
    readonly connected: boolean;
    readonly validate: boolean;
    create(options: IConnectionOptions): Promise<void>;
    destroy(): Promise<void>;
    createDatabase(options: IConnectionOptions): Promise<void>;
    dropDatabase(): Promise<void>;
    connect(options: IConnectionOptions): Promise<void>;
    disconnect(): Promise<void>;
    startTransaction(options?: ITransactionOptions): Promise<ATransaction>;
    prepare(transaction: ATransaction, sql: string): Promise<AStatement>;
    executeQuery(transaction: ATransaction, sql: string, params?: any[] | INamedParams): Promise<AResultSet>;
    execute(transaction: ATransaction, sql: string, params?: any[] | INamedParams): Promise<void>;
    executeReturning(transaction: ATransaction, sql: string, params?: any[] | INamedParams): Promise<Result>;
    private isBorrowed;
}
