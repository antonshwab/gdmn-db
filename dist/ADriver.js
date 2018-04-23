"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DefaultConnectionPool_1 = require("./default/connectionPool/DefaultConnectionPool");
class ADriver {
    /** Reade database structure as DBStructure object */
    async readDBStructure(transaction) {
        throw new Error("Unsupported yet");
    }
    /** Create object for access to the database */
    newConnection() {
        throw new Error("Unsupported yet");
    }
    /**
     * Create object for access to a specific connection pool of driver.
     * May not be available for the current driver.
     */
    newConnectionPool() {
        throw new Error("Unsupported yet");
    }
    /**
     * Create object for access to a default connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    newDefaultConnectionPool() {
        return new DefaultConnectionPool_1.DefaultConnectionPool(() => this.newConnection());
    }
}
exports.ADriver = ADriver;
//# sourceMappingURL=ADriver.js.map