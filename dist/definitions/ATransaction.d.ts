import { TExecutor } from "./ADatabase";
import { AResultSet } from "./AResultSet";
export declare type TTransaction = ATransaction<AResultSet>;
export declare abstract class ATransaction<RS extends AResultSet> {
    /**
     * Example:
     * <pre><code>
     * const result2 = ATransaction.executeTransaction(transaction, {}, async (transaction) => {
     *      return await transaction.query("some sql");
     * })}
     * </code></pre>
     *
     * @param {TTransaction} transaction
     * @param {TExecutor<TTransaction, R>} callback
     * @returns {Promise<R>}
     */
    static executeTransaction<R>(transaction: TTransaction, callback: TExecutor<TTransaction, R>): Promise<R>;
    abstract start(): Promise<void>;
    abstract commit(): Promise<void>;
    abstract rollback(): Promise<void>;
    abstract isActive(): Promise<boolean>;
    abstract executeSQL(sql: string, params?: any[]): Promise<RS>;
}
