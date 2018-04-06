import {Pool} from "generic-pool";
import {ADatabase, IDBOptions, TDatabase} from "../../ADatabase";
import {AResultSet} from "../../AResultSet";
import {TStatement} from "../../AStatement";
import {TTransaction} from "../../ATransaction";

export class DatabaseProxy<DBOptions> extends ADatabase<IDBOptions, AResultSet, TStatement, TTransaction> {

    private readonly _pool: Pool<TDatabase>;
    private readonly _databaseCreator: () => TDatabase;
    private _database: null | TDatabase = null;

    constructor(pool: Pool<TDatabase>, databaseCreator: () => TDatabase) {
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

    public async createTransaction(): Promise<TTransaction> {
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
