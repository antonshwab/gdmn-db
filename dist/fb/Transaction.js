"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ATransaction_1 = require("../ATransaction");
const fb_utils_1 = require("./utils/fb-utils");
class Transaction extends ATransaction_1.ATransaction {
    constructor(connection, options, handler) {
        super(connection, options);
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
        const handler = await connection.context.statusAction(async (status) => {
            const tpb = fb_utils_1.createTpb(apiOptions);
            return await connection.handler.startTransactionAsync(status, tpb.length, tpb);
        });
        return new Transaction(connection, options, handler);
    }
    async commit() {
        if (!this.handler) {
            throw new Error("Need absolute open transaction");
        }
        await this.connection.context.statusAction((status) => this.handler.commitAsync(status));
        this.handler = undefined;
        this.connection.transactions.delete(this);
    }
    async rollback() {
        if (!this.handler) {
            throw new Error("Need absolute open transaction");
        }
        await this.connection.context.statusAction((status) => this.handler.rollbackAsync(status));
        this.handler = undefined;
        this.connection.transactions.delete(this);
    }
}
Transaction.EXCLUDE_PATTERNS = [
    /-{2}.*/g,
    /\/\*[\s\S]*?\*\//g,
    /'[\s\S]*?'/g,
    /BEGIN[\s\S]*END/gi // begin ... end
];
Transaction.PLACEHOLDER_PATTERN = /(:[a-zA-Z0-9_]+)/g;
exports.Transaction = Transaction;
//# sourceMappingURL=Transaction.js.map