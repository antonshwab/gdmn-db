"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generic_pool_1 = require("generic-pool");
const AConnectionPool_1 = require("../../AConnectionPool");
const DefaultDatabaseProxy_1 = require("./DefaultDatabaseProxy");
class DefaultConnectionPool extends AConnectionPool_1.AConnectionPool {
    constructor(databaseCreator) {
        super();
        this._connectionPool = null;
        this._databaseCreator = databaseCreator;
    }
    async create(dbOptions, options) {
        if (this._connectionPool) {
            throw new Error("Connection pool already created");
        }
        this._connectionPool = generic_pool_1.createPool({
            create: async () => {
                if (!this._connectionPool) {
                    throw new Error("This error should never been happen");
                }
                const proxy = new DefaultDatabaseProxy_1.DatabaseProxy(this._connectionPool, this._databaseCreator);
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
        if (!this._connectionPool) {
            throw new Error("Connection pool need created");
        }
        await this._connectionPool.drain();
        await this._connectionPool.clear();
        this._connectionPool = null;
    }
    async get() {
        if (!this._connectionPool) {
            throw new Error("Connection pool need created");
        }
        return await this._connectionPool.acquire();
    }
    async isCreated() {
        return Boolean(this._connectionPool);
    }
}
exports.DefaultConnectionPool = DefaultConnectionPool;
//# sourceMappingURL=DefaultConnectionPool.js.map