"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Driver_1 = require("./fb/Driver");
class Factory {
    /** Firebird driver */
    static get FBDriver() {
        return new Driver_1.Driver();
    }
}
exports.Factory = Factory;
//# sourceMappingURL=Factory.js.map