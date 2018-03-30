"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AModule_1 = require("../AModule");
const FirebirdDatabase2_1 = require("./FirebirdDatabase2");
const FirebirdConnectionPool2_1 = require("./FirebirdConnectionPool2");
class FirebirdModule2 extends AModule_1.AModule {
    newConnectionPool() {
        return new FirebirdConnectionPool2_1.FirebirdConnectionPool2();
    }
    newDatabase() {
        return new FirebirdDatabase2_1.FirebirdDatabase2();
    }
}
exports.FirebirdModule2 = FirebirdModule2;
//# sourceMappingURL=FirebirdModule2.js.map