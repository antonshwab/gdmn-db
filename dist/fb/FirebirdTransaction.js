"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_driver_native_1 = require("node-firebird-driver-native");
const ATransaction_1 = require("../ATransaction");
const DefaultParamsAnalyzer_1 = require("../default/DefaultParamsAnalyzer");
const FirebirdDBStructure_1 = require("./FirebirdDBStructure");
const FirebirdResultSet_1 = require("./FirebirdResultSet");
const FirebirdStatement_1 = require("./FirebirdStatement");
class FirebirdTransaction extends ATransaction_1.ATransaction {
    constructor(connect, options) {
        super(options);
        this._transaction = null;
        this._connection = connect;
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
        this._transaction = await this._connection.startTransaction(options);
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
    async prepare(sql) {
        if (!this._transaction) {
            throw new Error("Need to open transaction");
        }
        const paramsAnalyzer = new DefaultParamsAnalyzer_1.DefaultParamsAnalyzer(sql, FirebirdTransaction.EXCLUDE_PATTERNS, FirebirdTransaction.PLACEHOLDER_PATTERN);
        const statement = await this._connection.prepare(this._transaction, paramsAnalyzer.sql);
        return new FirebirdStatement_1.FirebirdStatement(this._connection, this._transaction, statement, paramsAnalyzer);
    }
    async executeQuery(sql, params) {
        if (!this._transaction) {
            throw new Error("Need to open transaction");
        }
        const paramsAnalyzer = new DefaultParamsAnalyzer_1.DefaultParamsAnalyzer(sql, FirebirdTransaction.EXCLUDE_PATTERNS, FirebirdTransaction.PLACEHOLDER_PATTERN);
        const resultSet = await this._connection.executeQuery(this._transaction, paramsAnalyzer.sql, paramsAnalyzer.prepareParams(params));
        return new FirebirdResultSet_1.FirebirdResultSet(this._connection, this._transaction, resultSet);
    }
    async execute(sql, params) {
        if (!this._transaction) {
            throw new Error("Need to open transaction");
        }
        const paramsAnalyzer = new DefaultParamsAnalyzer_1.DefaultParamsAnalyzer(sql, FirebirdTransaction.EXCLUDE_PATTERNS, FirebirdTransaction.PLACEHOLDER_PATTERN);
        await this._connection.execute(this._transaction, paramsAnalyzer.sql, paramsAnalyzer.prepareParams(params));
    }
    async readDBStructure() {
        if (!this._transaction) {
            throw new Error("Need to open transaction");
        }
        return await FirebirdDBStructure_1.FirebirdDBStructure.readStructure(this);
    }
}
FirebirdTransaction.EXCLUDE_PATTERNS = [
    /-{2}.*/g,
    /\/\*[\s\S]*?\*\//g,
    /'[\s\S]*?'/g,
    /BEGIN[\s\S]*END/gi,
];
FirebirdTransaction.PLACEHOLDER_PATTERN = /(:[a-zA-Z0-9_]+)/g;
exports.FirebirdTransaction = FirebirdTransaction;
//# sourceMappingURL=FirebirdTransaction.js.map