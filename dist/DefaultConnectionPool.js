"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generic_pool_1 = require("generic-pool");
const AConnectionPool_1 = require("./AConnectionPool");
const ADatabase_1 = require("./ADatabase");
class DefaultConnectionPool extends AConnectionPool_1.AConnectionPool {
    constructor(databaseCreator) {
        super();
        this._connectionPool = null;
        this._databaseCreator = databaseCreator;
    }
    async create(dbOptions, options) {
        if (this._connectionPool)
            throw new Error("Connection pool already created");
        this._connectionPool = generic_pool_1.createPool({
            create: async () => {
                if (!this._connectionPool)
                    throw new Error("This error should never been happen");
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
    async destroy() {
        if (!this._connectionPool)
            throw new Error("Connection pool need created");
        await this._connectionPool.drain();
        await this._connectionPool.clear();
        this._connectionPool = null;
    }
    async get() {
        if (!this._connectionPool)
            throw new Error("Connection pool need created");
        return await this._connectionPool.acquire();
    }
    async isCreated() {
        return Boolean(this._connectionPool);
    }
}
exports.DefaultConnectionPool = DefaultConnectionPool;
class DatabaseProxy extends ADatabase_1.ADatabase {
    constructor(pool, databaseCreator) {
        super();
        this._database = null;
        this._pool = pool;
        this._databaseCreator = databaseCreator;
    }
    async createDatabase(options) {
        throw new Error("Invalid operation for connection from the pool");
    }
    async dropDatabase() {
        throw new Error("Invalid operation for connection from the pool");
    }
    async connect(options) {
        if (this._database)
            throw new Error("Invalid operation for connection from the pool");
        this._database = this._databaseCreator();
        await this._database.connect(options);
    }
    async disconnect() {
        if (!this._database)
            throw new Error("Need database connection");
        if (this._pool.isBorrowedResource(this)) { //there is no method in the file in .d.ts
            this._pool.release(this);
        }
        else {
            await this._database.disconnect();
        }
    }
    async createTransaction() {
        if (!this._database)
            throw new Error("Need database connection");
        return this._database.createTransaction();
    }
    async isConnected() {
        if (!this._database)
            return false;
        return this._database.isConnected();
    }
}
//# sourceMappingURL=DefaultConnectionPool.js.map