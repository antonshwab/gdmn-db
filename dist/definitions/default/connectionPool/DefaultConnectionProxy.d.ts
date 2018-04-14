import { Pool } from "generic-pool";
import { AConnection, IConnectionOptions } from "../../AConnection";
import { ATransaction } from "../../ATransaction";
export declare class ConnectionProxy extends AConnection {
    private readonly _pool;
    private readonly _connectionCreator;
    private _connection;
    constructor(pool: Pool<AConnection>, connectionCreator: () => AConnection);
    createDatabase(options: IConnectionOptions): Promise<void>;
    dropDatabase(): Promise<void>;
    connect(options: IConnectionOptions): Promise<void>;
    disconnect(): Promise<void>;
    createTransaction(): Promise<ATransaction>;
    isConnected(): Promise<boolean>;
    private isBorrowed();
}
