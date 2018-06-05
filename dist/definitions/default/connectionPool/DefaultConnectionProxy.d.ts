import { Pool } from "generic-pool";
import { AConnection, IConnectionOptions } from "../../AConnection";
import { AResultSet } from "../../AResultSet";
import { AStatement, INamedParams } from "../../AStatement";
import { ATransaction, ITransactionOptions } from "../../ATransaction";
export declare class ConnectionProxy extends AConnection {
    private readonly _pool;
    private readonly _connectionCreator;
    private _connection;
    constructor(pool: Pool<AConnection>, connectionCreator: () => AConnection);
    readonly connected: boolean;
    createDatabase(options: IConnectionOptions): Promise<void>;
    dropDatabase(): Promise<void>;
    connect(options: IConnectionOptions): Promise<void>;
    disconnect(): Promise<void>;
    startTransaction(options?: ITransactionOptions): Promise<ATransaction>;
    prepare(transaction: ATransaction, sql: string): Promise<AStatement>;
    executeQuery(transaction: ATransaction, sql: string, params?: any[] | INamedParams): Promise<AResultSet>;
    execute(transaction: ATransaction, sql: string, params?: any[] | INamedParams): Promise<void>;
    private isBorrowed;
}
