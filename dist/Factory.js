"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FirebirdModule_1 = require("./fb/FirebirdModule");
class Factory {
    /**
     * Firebird driver
     *
     * @returns {FirebirdModule}
     */
    static get FBModule() {
        return new FirebirdModule_1.FirebirdModule();
    }
}
exports.Factory = Factory;
//# sourceMappingURL=Factory.js.map