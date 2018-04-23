"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = require("../ATransaction");
const FirebirdStatement_1 = require("./FirebirdStatement");
const fb_utils_1 = require("./utils/fb-utils");
class FirebirdTransaction extends ATransaction_1.ATransaction {
    constructor(parent, options) {
        super(options);
        this.parent = parent;
    }
    static async create(parent, options) {
        return new FirebirdTransaction(parent, options);
    }
    async start() {
        if (this.handler) {
            throw new Error("Transaction already opened");
        }
        const options = {};
        switch (this._options.isolation) {
            case ATransaction_1.Isolation.SERIALIZABLE:
                options.isolation = fb_utils_1.TransactionIsolation.CONSISTENCY;
                options.waitMode = "NO_WAIT";
                break;
            case ATransaction_1.Isolation.REPEATABLE_READ:
                options.isolation = fb_utils_1.TransactionIsolation.SNAPSHOT;
                options.waitMode = "NO_WAIT";
                break;
            case ATransaction_1.Isolation.READ_UNCOMMITED:
                options.isolation = fb_utils_1.TransactionIsolation.READ_COMMITTED;
                options.readCommittedMode = "NO_RECORD_VERSION";
                options.waitMode = "NO_WAIT";
                break;
            case ATransaction_1.Isolation.READ_COMMITED:
            default:
                options.isolation = fb_utils_1.TransactionIsolation.READ_COMMITTED;
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
        this.handler = await this.parent.context.statusAction(async (status) => {
            const tpb = fb_utils_1.createTpb(options);
            return await this.parent.handler.startTransactionAsync(status, tpb.length, tpb);
        });
    }
    async commit() {
        if (!this.handler) {
            throw new Error("Need to open handler");
        }
        await this.parent.context.statusAction((status) => this.handler.commitAsync(status));
        this.handler = undefined;
    }
    async rollback() {
        if (!this.handler) {
            throw new Error("Need to open handler");
        }
        await this.parent.context.statusAction((status) => this.handler.rollbackAsync(status));
        this.handler = undefined;
    }
    async isActive() {
        return Boolean(this.handler);
    }
    async prepare(sql) {
        if (!this.handler) {
            throw new Error("Need to open handler");
        }
        return await FirebirdStatement_1.FirebirdStatement.prepare(this, sql);
    }
    async executeQuery(sql, params) {
        if (!this.handler) {
            throw new Error("Need to open handler");
        }
        const statement = await FirebirdStatement_1.FirebirdStatement.prepare(this, sql);
        const resultSet = await statement.executeQuery(params);
        return resultSet;
    }
    async execute(sql, params) {
        if (!this.handler) {
            throw new Error("Need to open handler");
        }
        await FirebirdTransaction.executePrepareStatement(this, sql, (statement) => statement.execute(params));
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