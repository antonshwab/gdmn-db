"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADriver_1 = require("../ADriver");
const FirebirdConnection_1 = require("./FirebirdConnection");
class FirebirdDriver extends ADriver_1.ADriver {
    newConnection() {
        return new FirebirdConnection_1.FirebirdConnection();
    }
}
exports.FirebirdDriver = FirebirdDriver;
//# sourceMappingURL=FirebirdDriver.js.map