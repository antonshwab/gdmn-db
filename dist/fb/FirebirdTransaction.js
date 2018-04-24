"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = require("../ATransaction");
const FirebirdStatement_1 = require("./FirebirdStatement");
const fb_utils_1 = require("./utils/fb-utils");
class FirebirdTransaction extends ATransaction_1.ATransaction {
    constructor(parent, options) {
        super(options);
        this.statements = new Set();
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
        this.parent.transactions.add(this);
    }
    async commit() {
        if (!this.handler) {
            throw new Error("Need to open transaction");
        }
        await this.closeChildren();
        await this.parent.context.statusAction((status) => this.handler.commitAsync(status));
        this.handler = undefined;
        this.parent.transactions.delete(this);
    }
    async rollback() {
        if (!this.handler) {
            throw new Error("Need to open transaction");
        }
        await this.closeChildren();
        await this.parent.context.statusAction((status) => this.handler.rollbackAsync(status));
        this.handler = undefined;
        this.parent.transactions.delete(this);
    }
    async isActive() {
        return Boolean(this.handler);
    }
    async prepare(sql) {
        if (!this.handler) {
            throw new Error("Need to open transaction");
        }
        return await FirebirdStatement_1.FirebirdStatement.prepare(this, sql);
    }
    async executeQuery(sql, params) {
        if (!this.handler) {
            throw new Error("Need to open transaction");
        }
        const statement = await FirebirdStatement_1.FirebirdStatement.prepare(this, sql);
        const resultSet = await statement.executeQuery(params);
        resultSet.disposeStatementOnClose = true;
        return resultSet;
    }
    async execute(sql, params) {
        if (!this.handler) {
            throw new Error("Need to open transaction");
        }
        await FirebirdTransaction.executePrepareStatement(this, sql, (statement) => statement.execute(params));
    }
    async closeChildren() {
        if (this.statements.size) {
            console.warn("Not all statements disposed, they will be disposed");
        }
        await Promise.all(Array.from(this.statements).reduceRight((promises, statement) => {
            promises.push(statement.dispose());
            return promises;
        }, []));
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