"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AConnection_1 = require("../../AConnection");
class ConnectionProxy extends AConnection_1.AConnection {
    constructor(pool, connectionCreator) {
        super();
        this._connection = null;
        this._pool = pool;
        this._connectionCreator = connectionCreator;
    }
    async createDatabase(options) {
        throw new Error("Invalid operation for connection from the pool");
    }
    async dropDatabase() {
        throw new Error("Invalid operation for connection from the pool");
    }
    async connect(options) {
        if (this._connection) {
            throw new Error("Invalid operation for connection from the pool");
        }
        this._connection = this._connectionCreator();
        await this._connection.connect(options);
    }
    async disconnect() {
        if (!this._connection) {
            throw new Error("Need database connection");
        }
        if (this.isBorrowed()) {
            this._pool.release(this);
        }
        else {
            await this._connection.disconnect();
        }
    }
    async createTransaction() {
        if (!this._connection || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        return this._connection.createTransaction();
    }
    async isConnected() {
        if (!this._connection || !this.isBorrowed()) {
            return false;
        }
        return this._connection.isConnected();
    }
    isBorrowed() {
        return this._pool.isBorrowedResource(this); // there is no method in the file in .d.ts
    }
}
exports.ConnectionProxy = ConnectionProxy;
//# sourceMappingURL=DefaultConnectionProxy.js.map