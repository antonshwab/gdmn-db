"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADriver_1 = require("../ADriver");
const FirebirdDatabase_1 = require("./FirebirdDatabase");
class FirebirdDriver extends ADriver_1.ADriver {
    newDatabase() {
        return new FirebirdDatabase_1.FirebirdDatabase();
    }
}
exports.FirebirdDriver = FirebirdDriver;
//# sourceMappingURL=FirebirdDriver.js.map