"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
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
        return this._transaction && this._transaction.isInTransaction();
    }
    async executeSQL(sql, params) {
        if (!this._transaction)
            throw new Error("Need to open transaction");
        const event = new events_1.EventEmitter();
        this._transaction.sequentially(sql, params, (row, index, next) => {
            event.emit(FirebirdTransaction.EVENT_DATA, row, index, next);
        })
            .then(() => event.emit(FirebirdTransaction.EVENT_END, null))
            .catch(error => event.emit(FirebirdTransaction.EVENT_END, error));
        return new FirebirdResultSet_1.FirebirdResultSet(event);
    }
    async readDBStructure() {
        if (!this._transaction)
            throw new Error("Need to open transaction");
        return await FirebirdDBStructure_1.FirebirdDBStructure.readStructure(this);
    }
}
FirebirdTransaction.EVENT_DATA = "data";
FirebirdTransaction.EVENT_END = "end";
exports.FirebirdTransaction = FirebirdTransaction;
//# sourceMappingURL=FirebirdTransaction.js.map