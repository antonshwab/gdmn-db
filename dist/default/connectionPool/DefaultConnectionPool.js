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
                const proxy = new DefaultConnectionProxy_1.DefaultConnectionProxy(this._connectionPool, this._connectionCreator);
                await proxy.create(dbOptions);
                return proxy;
            },
            destroy: async (proxy) => {
                await proxy.destroy();
                return undefined;
            },
            validate: async (proxy) => proxy.validate
        }, Object.assign({}, options, { autostart: false, testOnBorrow: true }));
        this._connectionPool.addListener("factoryCreateError", console.error);
        this._connectionPool.addListener("factoryDestroyError", console.error);
        this._connectionPool.start();
    }
    async destroy() {
        if (!this._connectionPool) {
            throw new Error("Connection pool need created");
        }
        await this._connectionPool.drain();
        // workaround; Wait until quantity minimum connections is established
        await Promise.all(Array.from(this._connectionPool._factoryCreateOperations).map(reflector));
        await this._connectionPool.clear();
        this._connectionPool.removeListener("factoryCreateError", console.error);
        this._connectionPool.removeListener("factoryDestroyError", console.error);
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
function noop() {
    // ignore
}
/**
 * Reflects a promise but does not expose any
 * underlying value or rejection from that promise.
 * @param  {Promise} promise [description]
 * @return {Promise}         [description]
 */
const reflector = (promise) => {
    return promise.then(noop, noop);
};
//# sourceMappingURL=DefaultConnectionPool.js.map