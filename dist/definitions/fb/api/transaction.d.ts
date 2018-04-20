import * as fb from "node-firebird-native-api";
import { Attachment } from "./attachment";
import { TransactionOptions } from "./types";
/** Transaction implementation. */
export declare class Transaction {
    attachment: Attachment | undefined;
    transactionHandle?: fb.Transaction;
    protected constructor(attachment?: Attachment | undefined);
    static start(attachment: Attachment, options?: TransactionOptions): Promise<Transaction>;
    /** Commits and release this transaction object. */
    commit(): Promise<void>;
    /** Commits and maintains this transaction object for subsequent work. */
    commitRetaining(): Promise<void>;
    /** Rollbacks and release this transaction object. */
    rollback(): Promise<void>;
    /** Rollbacks and maintains this transaction object for subsequent work. */
    rollbackRetaining(): Promise<void>;
}
