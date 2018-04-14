import {Pool} from "generic-pool";
import {ADatabase, IDBOptions} from "../../ADatabase";
import {ATransaction} from "../../ATransaction";

export class DatabaseProxy extends ADatabase {

    private readonly _pool: Pool<ADatabase>;
    private readonly _databaseCreator: () => ADatabase;
    private _database: null | ADatabase = null;

    constructor(pool: Pool<ADatabase>, databaseCreator: () => ADatabase) {
        super();
        this._pool = pool;
        this._databaseCreator = databaseCreator;
    }

    public async createDatabase(options: IDBOptions): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    public async dropDatabase(): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    public async connect(options: IDBOptions): Promise<void> {
        if (this._database) {
            throw new Error("Invalid operation for connection from the pool");
        }

        this._database = this._databaseCreator();
        await this._database.connect(options);
    }

    public async disconnect(): Promise<void> {
        if (!this._database) {
            throw new Error("Need database connection");
        }

        if (this.isBorrowed()) {
            this._pool.release(this);
        } else {
            await this._database.disconnect();
        }
    }

    public async createTransaction(): Promise<ATransaction> {
        if (!this._database || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        return this._database.createTransaction();
    }

    public async isConnected(): Promise<boolean> {
        if (!this._database || !this.isBorrowed()) {
            return false;
        }
        return this._database.isConnected();
    }

    private isBorrowed(): boolean {
        return (this._pool as any).isBorrowedResource(this);    // there is no method in the file in .d.ts
    }
}
