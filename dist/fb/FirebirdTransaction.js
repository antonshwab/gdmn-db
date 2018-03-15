"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = __importDefault(require("../ATransaction"));
class FirebirdTransaction extends ATransaction_1.default {
    constructor(database) {
        super();
        this._database = database;
    }
    async start() {
        this._transaction = await this._database.transaction();
    }
    async commit() {
        await this._transaction.commit();
    }
    async rollback() {
        await this._transaction.rollback();
    }
    async isActive() {
        return this._transaction.isInTransaction();
    }
    async query(query, params) {
        return await this._transaction.query(query, params);
    }
    async querySequentially(query, callback, params) {
        return await this._transaction.sequentially(query, params, callback);
    }
}
exports.default = FirebirdTransaction;
//# sourceMappingURL=FirebirdTransaction.js.map