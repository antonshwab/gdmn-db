"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_driver_native_1 = require("node-firebird-driver-native");
const ATransaction_1 = require("../ATransaction");
const FirebirdDBStructure_1 = require("./FirebirdDBStructure");
const FirebirdResultSet_1 = require("./FirebirdResultSet");
const FirebirdStatement_1 = require("./FirebirdStatement");
const ParamsAnalyzer_1 = require("./ParamsAnalyzer");
class FirebirdTransaction extends ATransaction_1.ATransaction {
    constructor(connect, options) {
        super(options);
        this._transaction = null;
        this._connect = connect;
    }
    async start() {
        if (this._transaction) {
            throw new Error("Transaction already opened");
        }
        const options = {};
        switch (this._options.isolation) {
            case ATransaction_1.Isolation.SERIALIZABLE:
                options.isolation = node_firebird_driver_native_1.TransactionIsolation.CONSISTENCY;
                options.waitMode = "NO_WAIT";
                break;
            case ATransaction_1.Isolation.REPEATABLE_READ:
                options.isolation = node_firebird_driver_native_1.TransactionIsolation.SNAPSHOT;
                options.waitMode = "NO_WAIT";
                break;
            case ATransaction_1.Isolation.READ_UNCOMMITED:
                options.isolation = node_firebird_driver_native_1.TransactionIsolation.READ_COMMITTED;
                options.readCommittedMode = "NO_RECORD_VERSION";
                options.waitMode = "NO_WAIT";
                break;
            case ATransaction_1.Isolation.READ_COMMITED:
            default:
                options.isolation = node_firebird_driver_native_1.TransactionIsolation.READ_COMMITTED;
                options.readCommittedMode = "RECORD_VERSION";
                options.waitMode = "NO_WAIT";
                break;
        }
        switch (this._options.accessMode) {
            case ATransaction_1.AccessMode.READ_ONLY:
                options.accessMode = "READ_ONLY";
                break;
            case ATransaction_1.AccessMode.READ_WRITE:
            default:
                options.accessMode = "READ_WRITE";
        }
        this._transaction = await this._connect.startTransaction(options);
    }
    async commit() {
        if (!this._transaction) {
            throw new Error("Need to open transaction");
        }
        await this._transaction.commit();
        this._transaction = null;
    }
    async rollback() {
        if (!this._transaction) {
            throw new Error("Need to open transaction");
        }
        await this._transaction.rollback();
        this._transaction = null;
    }
    async isActive() {
        return Boolean(this._transaction);
    }
    async prepareSQL(sql) {
        if (!this._transaction) {
            throw new Error("Need to open transaction");
        }
        const paramsAnalyzer = new ParamsAnalyzer_1.ParamsAnalyzer(sql);
        const statement = await this._connect.prepare(this._transaction, paramsAnalyzer.sql);
        return new FirebirdStatement_1.FirebirdStatement(this._connect, this._transaction, statement, paramsAnalyzer);
    }
    async executeSQL(sql, params) {
        if (!this._transaction) {
            throw new Error("Need to open transaction");
        }
        const paramsAnalyzer = new ParamsAnalyzer_1.ParamsAnalyzer(sql);
        const resultSet = await this._connect.executeQuery(this._transaction, paramsAnalyzer.sql, paramsAnalyzer.prepareParams(params));
        return new FirebirdResultSet_1.FirebirdResultSet(this._connect, this._transaction, resultSet);
    }
    async readDBStructure() {
        if (!this._transaction) {
            throw new Error("Need to open transaction");
        }
        return await FirebirdDBStructure_1.FirebirdDBStructure.readStructure(this);
    }
}
exports.FirebirdTransaction = FirebirdTransaction;
//# sourceMappingURL=FirebirdTransaction.js.map