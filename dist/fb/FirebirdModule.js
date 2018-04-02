"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AModule_1 = require("../AModule");
const FirebirdDatabase_1 = require("./FirebirdDatabase");
const FirebirdConnectionPool_1 = require("./FirebirdConnectionPool");
const DefaultConnectionPool_1 = require("../DefaultConnectionPool");
class FirebirdModule extends AModule_1.AModule {
    newDefaultConnectionPool() {
        return new DefaultConnectionPool_1.DefaultConnectionPool(() => new FirebirdDatabase_1.FirebirdDatabase());
    }
    newConnectionPool() {
        return new FirebirdConnectionPool_1.FirebirdConnectionPool();
    }
    newDatabase() {
        return new FirebirdDatabase_1.FirebirdDatabase();
    }
}
exports.FirebirdModule = FirebirdModule;
//# sourceMappingURL=FirebirdModule.js.map