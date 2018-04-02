"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = require("../ATransaction");
const FirebirdResultSet_1 = require("./FirebirdResultSet");
const FirebirdDBStructure_1 = require("./FirebirdDBStructure");
class FirebirdTransaction extends ATransaction_1.ATransaction {
    constructor(connect) {
        super();
        this._transaction = null;
        this._connect = connect;
    }
    async start() {
        if (this._transaction)
            throw new Error("Transaction already opened");
        this._transaction = await this._connect.startTransaction();
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
        return Boolean(this._transaction);
    }
    async executeSQL(sql, params) {
        if (!this._transaction)
            throw new Error("Need to open transaction");
        const resultSet = await this._connect.executeQuery(this._transaction, sql, params);
        return new FirebirdResultSet_1.FirebirdResultSet(this._connect, this._transaction, resultSet);
    }
    async readDBStructure() {
        if (!this._transaction)
            throw new Error("Need to open transaction");
        return await FirebirdDBStructure_1.FirebirdDBStructure.readStructure(this);
    }
}
exports.FirebirdTransaction = FirebirdTransaction;
//# sourceMappingURL=FirebirdTransaction.js.map