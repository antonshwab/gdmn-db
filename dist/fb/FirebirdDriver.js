"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADriver_1 = require("../ADriver");
const FirebirdConnection_1 = require("./FirebirdConnection");
const FirebirdDBStructure_1 = require("./FirebirdDBStructure");
class FirebirdDriver extends ADriver_1.ADriver {
    async readDBStructure(transaction) {
        return FirebirdDBStructure_1.FirebirdDBStructure.readStructure(transaction);
    }
    newConnection() {
        return new FirebirdConnection_1.FirebirdConnection();
    }
}
exports.FirebirdDriver = FirebirdDriver;
//# sourceMappingURL=FirebirdDriver.js.map