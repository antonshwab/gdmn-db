"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FirebirdModule_1 = require("./fb/FirebirdModule");
const FirebirdModule2_1 = require("./fb2/FirebirdModule2");
class Factory {
    static get FBModule() {
        return new FirebirdModule_1.FirebirdModule();
    }
    static get FBModule2() {
        return new FirebirdModule2_1.FirebirdModule2();
    }
}
exports.Factory = Factory;
//# sourceMappingURL=Factory.js.map