"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AConnectionPool_1 = require("../AConnectionPool");
const FirebirdDatabase_1 = require("./FirebirdDatabase");
const FBDatabase_1 = require("./driver/FBDatabase");
class FirebirdConnectionPool extends AConnectionPool_1.AConnectionPool {
    constructor() {
        super(...arguments);
        this._connectionPool = new FBDatabase_1.FBConnectionPool();
    }
    async isCreated() {
        return this._connectionPool.isConnectionPoolCreated();
    }
    async get() {
        const db = await this._connectionPool.attach();
        return new FirebirdDatabase_1.FirebirdDatabase(db);
    }
    async create(dbOptions, options) {
        return this._connectionPool.createConnectionPool(dbOptions, options.max);
    }
    async destroy() {
        return this._connectionPool.destroyConnectionPool();
    }
}
exports.FirebirdConnectionPool = FirebirdConnectionPool;
//# sourceMappingURL=FirebirdConnectionPool.js.map