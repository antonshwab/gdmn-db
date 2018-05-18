"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = require("../ATransaction");
const fb_utils_1 = require("./utils/fb-utils");
class Transaction extends ATransaction_1.ATransaction {
    constructor(connection, options, handler) {
        super(connection, options);
        this.statements = new Set();
        this.handler = handler;
        this.connection.transactions.add(this);
    }
    get connection() {
        return super.connection;
    }
    get finished() {
        return !this.handler;
    }
    static async create(connection, options = ATransaction_1.ATransaction.DEFAULT_OPTIONS) {
        const apiOptions = {};
        switch (options.isolation) {
            case ATransaction_1.Isolation.SERIALIZABLE:
                apiOptions.isolation = fb_utils_1.TransactionIsolation.CONSISTENCY;
                apiOptions.waitMode = "NO_WAIT";
                break;
            case ATransaction_1.Isolation.REPEATABLE_READ:
                apiOptions.isolation = fb_utils_1.TransactionIsolation.SNAPSHOT;
                apiOptions.waitMode = "NO_WAIT";
                break;
            case ATransaction_1.Isolation.READ_UNCOMMITED:
                apiOptions.isolation = fb_utils_1.TransactionIsolation.READ_COMMITTED;
                apiOptions.readCommittedMode = "NO_RECORD_VERSION";
                apiOptions.waitMode = "NO_WAIT";
                break;
            case ATransaction_1.Isolation.READ_COMMITED:
            default:
                apiOptions.isolation = fb_utils_1.TransactionIsolation.READ_COMMITTED;
                apiOptions.readCommittedMode = "RECORD_VERSION";
                apiOptions.waitMode = "NO_WAIT";
                break;
        }
        switch (options.accessMode) {
            case ATransaction_1.AccessMode.READ_ONLY:
                apiOptions.accessMode = "READ_ONLY";
                break;
            case ATransaction_1.AccessMode.READ_WRITE:
            default:
                apiOptions.accessMode = "READ_WRITE";
        }
        const handler = await connection.client.statusAction(async (status) => {
            const tpb = fb_utils_1.createTpb(apiOptions);
            return await connection.handler.startTransactionAsync(status, tpb.length, tpb);
        });
        return new Transaction(connection, options, handler);
    }
    async commit() {
        if (!this.handler) {
            throw new Error("Need absolute open transaction");
        }
        await this._closeChildren();
        await this.connection.client.statusAction((status) => this.handler.commitAsync(status));
        this.handler = undefined;
        this.connection.transactions.delete(this);
    }
    async rollback() {
        if (!this.handler) {
            throw new Error("Need absolute open transaction");
        }
        await this._closeChildren();
        await this.connection.client.statusAction((status) => this.handler.rollbackAsync(status));
        this.handler = undefined;
        this.connection.transactions.delete(this);
    }
    async _closeChildren() {
        if (this.statements.size) {
            console.warn("Not all statements disposed, they will be disposed");
        }
        await Promise.all(Array.from(this.statements).reduceRight((promises, statement) => {
            promises.push(statement.dispose());
            return promises;
        }, []));
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=Transaction.js.map