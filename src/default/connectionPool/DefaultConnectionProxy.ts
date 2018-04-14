import {Pool} from "generic-pool";
import {AConnection, IConnectionOptions} from "../../AConnection";
import {ATransaction} from "../../ATransaction";

export class ConnectionProxy extends AConnection {

    private readonly _pool: Pool<AConnection>;
    private readonly _connectionCreator: () => AConnection;
    private _connection: null | AConnection = null;

    constructor(pool: Pool<AConnection>, connectionCreator: () => AConnection) {
        super();
        this._pool = pool;
        this._connectionCreator = connectionCreator;
    }

    public async createDatabase(options: IConnectionOptions): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    public async dropDatabase(): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    public async connect(options: IConnectionOptions): Promise<void> {
        if (this._connection) {
            throw new Error("Invalid operation for connection from the pool");
        }

        this._connection = this._connectionCreator();
        await this._connection.connect(options);
    }

    public async disconnect(): Promise<void> {
        if (!this._connection) {
            throw new Error("Need database connection");
        }

        if (this.isBorrowed()) {
            this._pool.release(this);
        } else {
            await this._connection.disconnect();
        }
    }

    public async createTransaction(): Promise<ATransaction> {
        if (!this._connection || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        return this._connection.createTransaction();
    }

    public async isConnected(): Promise<boolean> {
        if (!this._connection || !this.isBorrowed()) {
            return false;
        }
        return this._connection.isConnected();
    }

    private isBorrowed(): boolean {
        return (this._pool as any).isBorrowedResource(this);    // there is no method in the file in .d.ts
    }
}
