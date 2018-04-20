import * as fb from "node-firebird-native-api";
import {Attachment} from "./attachment";
import {createTpb} from "./fb-utils";
import {TransactionOptions} from "./types";

/** Transaction implementation. */
export class Transaction {

    public transactionHandle?: fb.Transaction;

    protected constructor(public attachment?: Attachment) {
    }

    public static async start(attachment: Attachment,
                              options?: TransactionOptions): Promise<Transaction> {
        const transaction = new Transaction(attachment);

        if (!attachment.client) {
            throw new Error("Test");
        }
        return await attachment.client.statusAction(async (status) => {
            const tpb = createTpb(options);
            transaction.transactionHandle =
                await attachment!.attachmentHandle!.startTransactionAsync(status, tpb.length, tpb);
            return transaction;
        });
    }

    /** Commits and release this transaction object. */
    public async commit(): Promise<void> {
        if (!this.attachment || !this.attachment.client) {
            throw new Error("Transaction is already committed or rolled back.");
        }

        await this.attachment.client.statusAction((status) => this.transactionHandle!.commitAsync(status));
        this.transactionHandle = undefined;

        this.attachment!.transactions.delete(this);
        this.attachment = undefined;
    }

    /** Commits and maintains this transaction object for subsequent work. */
    public async commitRetaining(): Promise<void> {
        this.check();

        return await this.attachment!.client!.statusAction(
            (status) => this.transactionHandle!.commitRetainingAsync(status));
    }

    /** Rollbacks and release this transaction object. */
    public async rollback(): Promise<void> {
        this.check();

        await this.attachment!.client!.statusAction((status) => this.transactionHandle!.rollbackAsync(status));
        this.transactionHandle = undefined;

        this.attachment!.transactions.delete(this);
        this.attachment = undefined;
    }

    /** Rollbacks and maintains this transaction object for subsequent work. */
    public async rollbackRetaining(): Promise<void> {
        this.check();

        return await this.attachment!.client!.statusAction(
            (status) => this.transactionHandle!.rollbackRetainingAsync(status));
    }

    private check(): void {
        if (!this.attachment) {
            throw new Error("Transaction is already committed or rolled back.");
        }
    }
}
