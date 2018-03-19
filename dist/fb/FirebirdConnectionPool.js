"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AConnectionPool_1 = require("../AConnectionPool");
const FirebirdDatabase_1 = require("./FirebirdDatabase");
const FBDatabase_1 = require("./FBDatabase");
class FirebirdConnectionPool extends AConnectionPool_1.AConnectionPool {
    constructor() {
        super(...arguments);
        this._connectionPool = new FBDatabase_1.FBConnectionPool();
    }
    async attach() {
        const db = await this._connectionPool.attach();
        return new FirebirdDatabase_1.FirebirdDatabase(db);
    }
    async create(options, maxConnections) {
        return this._connectionPool.createConnectionPool(options, maxConnections);
    }
    async destroy() {
        return this._connectionPool.destroyConnectionPool();
    }
}
exports.FirebirdConnectionPool = FirebirdConnectionPool;
//# sourceMappingURL=FirebirdConnectionPool.js.map