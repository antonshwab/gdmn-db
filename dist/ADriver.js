"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommonConnectionPool_1 = require("./common/connectionPool/CommonConnectionPool");
class ADriver {
    /** Reade database structure as DBStructure object */
    async readDBStructure(connection, transaction) {
        throw new Error("Unsupported yet");
    }
    /** Create object for access absolute the database */
    newConnection() {
        throw new Error("Unsupported yet");
    }
    /**
     * Create object for access absolute a specific connection pool of driver.
     * May not be available for the current driver.
     */
    newConnectionPool() {
        throw new Error("Unsupported yet");
    }
    /**
     * Create service for backup/restore databases
     */
    newService() {
        throw new Error("Unsupported yet");
    }
    /**
     * Create object for access absolute a common connection pool of driver.
     * Available for all drivers.
     *
     * @see {@link https://github.com/coopernurse/node-pool}
     */
    newCommonConnectionPool() {
        return new CommonConnectionPool_1.CommonConnectionPool(() => this.newConnection());
    }
}
exports.ADriver = ADriver;
//# sourceMappingURL=ADriver.js.map