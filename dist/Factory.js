"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FirebirdDriver_1 = require("./fb/FirebirdDriver");
class Factory {
    /** Firebird driver */
    static get FBDriver() {
        return new FirebirdDriver_1.FirebirdDriver();
    }
}
exports.Factory = Factory;
//# sourceMappingURL=Factory.js.map