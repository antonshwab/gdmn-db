import {createPool, Pool} from "generic-pool";
import {AConnectionPool} from "./AConnectionPool";
import {ADatabase, TDatabase, TDBOptions} from "./ADatabase";
import {TTransaction} from "./ATransaction";
import {TStatement} from "./AStatement";
import {AResultSet} from "./AResultSet";

export type DefaultConnectionPoolOptions = {    //from require(generic-pool).Options
    max?: number;
    min?: number;
    maxWaitingClients?: number;
    testOnBorrow?: boolean;
    acquireTimeoutMillis?: number;
    fifo?: boolean;
    priorityRange?: number;
    autostart?: boolean;
    evictionRunIntervalMillis?: number;
    numTestsPerRun?: number;
    softIdleTimeoutMillis?: number;
    idleTimeoutMillis?: number;
};

export type DBCreator<DB> = () => DB;

export class DefaultConnectionPool<DBOptions> extends AConnectionPool<DefaultConnectionPoolOptions, TDBOptions,
    AResultSet, TStatement, TTransaction, TDatabase> {

    private readonly _databaseCreator: DBCreator<TDatabase>;
    private _connectionPool: null | Pool<TDatabase> = null;

    constructor(databaseCreator: DBCreator<TDatabase>) {
        super();
        this._databaseCreator = databaseCreator;
    }

    async create(dbOptions: TDBOptions, options: DefaultConnectionPoolOptions): Promise<void> {
        if (this._connectionPool) throw new Error("Connection pool already created");

        this._connectionPool = createPool({
            create: async () => {
                if (!this._connectionPool) throw new Error("This error should never been happen");

                const proxy = new DatabaseProxy(this._connectionPool, this._databaseCreator);
                await proxy.connect(dbOptions);
                return proxy;
            },
            destroy: async (proxy) => {
                await proxy.disconnect();
                return undefined;
            },
            validate: async (proxy) => await proxy.isConnected()
        }, options);
    }

    async destroy(): Promise<void> {
        if (!this._connectionPool) throw new Error("Connection pool need created");

        await this._connectionPool.drain();
        await this._connectionPool.clear();
        this._connectionPool = null;
    }

    async get(): Promise<TDatabase> {
        if (!this._connectionPool) throw new Error("Connection pool need created");

        return await this._connectionPool.acquire();
    }

    async isCreated(): Promise<boolean> {
        return Boolean(this._connectionPool);
    }
}

class DatabaseProxy<DBOptions> extends ADatabase<TDBOptions, AResultSet, TStatement, TTransaction> {

    private readonly _pool: Pool<TDatabase>;
    private readonly _databaseCreator: () => TDatabase;
    private _database: null | TDatabase = null;

    constructor(pool: Pool<TDatabase>, databaseCreator: () => TDatabase) {
        super();
        this._pool = pool;
        this._databaseCreator = databaseCreator;
    }

    async createDatabase(options: TDBOptions): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    async dropDatabase(): Promise<void> {
        throw new Error("Invalid operation for connection from the pool");
    }

    async connect(options: TDBOptions): Promise<void> {
        if (this._database) throw new Error("Invalid operation for connection from the pool");

        this._database = this._databaseCreator();
        await this._database.connect(options);
    }

    async disconnect(): Promise<void> {
        if (!this._database) throw new Error("Need database connection");

        if ((<any>this._pool).isBorrowedResource(this)) {//there is no method in the file in .d.ts
            this._pool.release(this);
        } else {
            await this._database.disconnect();
        }
    }

    async createTransaction(): Promise<TTransaction> {
        if (!this._database) throw new Error("Need database connection");
        return this._database.createTransaction();
    }

    async isConnected(): Promise<boolean> {
        if (!this._database) return false;
        return this._database.isConnected();
    }
}