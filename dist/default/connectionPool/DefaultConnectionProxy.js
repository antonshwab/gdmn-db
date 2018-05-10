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
    get connected() {
        if (!this._connection || !this.isBorrowed()) {
            return false;
        }
        return this._connection.connected;
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
    async startTransaction(options) {
        if (!this._connection || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        return await this._connection.startTransaction(options);
    }
    async prepare(transaction, sql) {
        if (!this._connection || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        return await this._connection.prepare(transaction, sql);
    }
    async executeQuery(transaction, sql, params) {
        if (!this._connection || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        return await this._connection.executeQuery(transaction, sql);
    }
    async execute(transaction, sql, params) {
        if (!this._connection || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        await this._connection.execute(transaction, sql);
    }
    isBorrowed() {
        return this._pool.isBorrowedResource(this); // there is no method in the file in .d.ts
    }
}
exports.ConnectionProxy = ConnectionProxy;
//# sourceMappingURL=DefaultConnectionProxy.js.map