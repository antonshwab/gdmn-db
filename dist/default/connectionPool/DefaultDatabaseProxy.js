"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADatabase_1 = require("../../ADatabase");
class DatabaseProxy extends ADatabase_1.ADatabase {
    constructor(pool, databaseCreator) {
        super();
        this._database = null;
        this._pool = pool;
        this._databaseCreator = databaseCreator;
    }
    async createDatabase(options) {
        throw new Error("Invalid operation for connection from the pool");
    }
    async dropDatabase() {
        throw new Error("Invalid operation for connection from the pool");
    }
    async connect(options) {
        if (this._database) {
            throw new Error("Invalid operation for connection from the pool");
        }
        this._database = this._databaseCreator();
        await this._database.connect(options);
    }
    async disconnect() {
        if (!this._database) {
            throw new Error("Need database connection");
        }
        if (this.isBorrowed()) {
            this._pool.release(this);
        }
        else {
            await this._database.disconnect();
        }
    }
    async createTransaction() {
        if (!this._database || !this.isBorrowed()) {
            throw new Error("Need database connection");
        }
        return this._database.createTransaction();
    }
    async isConnected() {
        if (!this._database || !this.isBorrowed()) {
            return false;
        }
        return this._database.isConnected();
    }
    isBorrowed() {
        return this._pool.isBorrowedResource(this); // there is no method in the file in .d.ts
    }
}
exports.DatabaseProxy = DatabaseProxy;
//# sourceMappingURL=DefaultDatabaseProxy.js.map