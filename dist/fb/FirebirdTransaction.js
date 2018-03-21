"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = require("../ATransaction");
const FirebirdResultSet_1 = require("./FirebirdResultSet");
const FirebirdDBStructure_1 = require("./FirebirdDBStructure");
class FirebirdTransaction extends ATransaction_1.ATransaction {
    constructor(database) {
        super();
        this._database = database;
    }
    async start() {
        if (this._transaction)
            throw new Error("Transaction already opened");
        this._transaction = await this._database.transaction();
    }
    async commit() {
        if (!this._transaction)
            throw new Error("Need to open transaction");
        await this._transaction.commit();
        this._transaction = null;
    }
    async rollback() {
        if (!this._transaction)
            throw new Error("Need to open transaction");
        await this._transaction.rollback();
        this._transaction = null;
    }
    async isActive() {
        if (!this._transaction)
            throw new Error("Need to open transaction");
        return this._transaction.isInTransaction();
    }
    async executeSQL(sql, params) {
        if (!this._transaction)
            throw new Error("Need to open transaction");
        const result = await this._transaction.query(sql, params); //TODO sequentially
        return new FirebirdResultSet_1.FirebirdResultSet(result);
    }
    async readDBStructure() {
        return await FirebirdDBStructure_1.FirebirdDBStructure.readStructure(this);
    }
}
exports.FirebirdTransaction = FirebirdTransaction;
//# sourceMappingURL=FirebirdTransaction.js.map