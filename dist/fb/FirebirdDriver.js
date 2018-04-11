"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADriver_1 = require("../ADriver");
const DefaultConnectionPool_1 = require("../default/connectionPool/DefaultConnectionPool");
const FirebirdDatabase_1 = require("./FirebirdDatabase");
class FirebirdDriver extends ADriver_1.ADriver {
    /**
     * Create object for access to a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    newDefaultConnectionPool() {
        return new DefaultConnectionPool_1.DefaultConnectionPool(() => new FirebirdDatabase_1.FirebirdDatabase());
    }
    /** Do not support this driver */
    newConnectionPool() {
        throw new Error("Unsupported yet");
    }
    /** Create object for access to the database */
    newDatabase() {
        return new FirebirdDatabase_1.FirebirdDatabase();
    }
}
exports.FirebirdDriver = FirebirdDriver;
//# sourceMappingURL=FirebirdDriver.js.map