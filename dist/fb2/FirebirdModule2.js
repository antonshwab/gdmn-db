"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AModule_1 = require("../AModule");
const FirebirdDatabase2_1 = require("./FirebirdDatabase2");
const DefaultConnectionPool_1 = require("../DefaultConnectionPool");
class FirebirdModule2 extends AModule_1.AModule {
    newDefaultConnectionPool() {
        return new DefaultConnectionPool_1.DefaultConnectionPool(() => new FirebirdDatabase2_1.FirebirdDatabase2());
    }
    newConnectionPool() {
        throw new Error("Unsupported yet");
    }
    newDatabase() {
        return new FirebirdDatabase2_1.FirebirdDatabase2();
    }
}
exports.FirebirdModule2 = FirebirdModule2;
//# sourceMappingURL=FirebirdModule2.js.map