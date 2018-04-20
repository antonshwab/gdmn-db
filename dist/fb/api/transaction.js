"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fb_utils_1 = require("./fb-utils");
/** Transaction implementation. */
class Transaction {
    constructor(attachment) {
        this.attachment = attachment;
    }
    static async start(attachment, options) {
        const transaction = new Transaction(attachment);
        if (!attachment || !attachment.client) {
            throw new Error("Transaction is already committed or rolled back.");
        }
        return await attachment.client.statusAction(async (status) => {
            const tpb = fb_utils_1.createTpb(options);
            transaction.transactionHandle =
                await attachment.attachmentHandle.startTransactionAsync(status, tpb.length, tpb);
            return transaction;
        });
    }
    /** Commits and release this transaction object. */
    async commit() {
        if (!this.attachment || !this.attachment.client) {
            throw new Error("Transaction is already committed or rolled back.");
        }
        await this.attachment.client.statusAction((status) => this.transactionHandle.commitAsync(status));
        this.transactionHandle = undefined;
        this.attachment.transactions.delete(this);
        this.attachment = undefined;
    }
    /** Commits and maintains this transaction object for subsequent work. */
    async commitRetaining() {
        if (!this.attachment || !this.attachment.client) {
            throw new Error("Transaction is already committed or rolled back.");
        }
        return await this.attachment.client.statusAction((status) => this.transactionHandle.commitRetainingAsync(status));
    }
    /** Rollbacks and release this transaction object. */
    async rollback() {
        if (!this.attachment || !this.attachment.client) {
            throw new Error("Transaction is already committed or rolled back.");
        }
        await this.attachment.client.statusAction((status) => this.transactionHandle.rollbackAsync(status));
        this.transactionHandle = undefined;
        this.attachment.transactions.delete(this);
        this.attachment = undefined;
    }
    /** Rollbacks and maintains this transaction object for subsequent work. */
    async rollbackRetaining() {
        if (!this.attachment || !this.attachment.client) {
            throw new Error("Transaction is already committed or rolled back.");
        }
        return await this.attachment.client.statusAction((status) => this.transactionHandle.rollbackRetainingAsync(status));
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map