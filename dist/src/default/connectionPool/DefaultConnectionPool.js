"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generic_pool_1 = require("generic-pool");
const AConnectionPool_1 = require("../../AConnectionPool");
const DefaultConnectionProxy_1 = require("./DefaultConnectionProxy");
class DefaultConnectionPool extends AConnectionPool_1.AConnectionPool {
    constructor(connectionCreator) {
        super();
        this._connectionPool = null;
        this._connectionCreator = connectionCreator;
    }
    get created() {
        return Boolean(this._connectionPool);
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
                const proxy = new DefaultConnectionProxy_1.ConnectionProxy(this._connectionPool, this._connectionCreator);
                await proxy.connect(dbOptions);
                return proxy;
            },
            destroy: async (proxy) => {
                await proxy.disconnect();
                return undefined;
            },
            validate: async (proxy) => proxy.connected
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
}
exports.DefaultConnectionPool = DefaultConnectionPool;
//# sourceMappingURL=DefaultConnectionPool.js.map