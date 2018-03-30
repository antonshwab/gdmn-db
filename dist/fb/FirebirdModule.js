"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AModule_1 = require("../AModule");
const FirebirdDatabase_1 = require("./FirebirdDatabase");
const FirebirdConnectionPool_1 = require("./FirebirdConnectionPool");
class FirebirdModule extends AModule_1.AModule {
    newConnectionPool() {
        return new FirebirdConnectionPool_1.FirebirdConnectionPool();
    }
    newDatabase() {
        return new FirebirdDatabase_1.FirebirdDatabase();
    }
}
exports.FirebirdModule = FirebirdModule;
//# sourceMappingURL=FirebirdModule.js.map