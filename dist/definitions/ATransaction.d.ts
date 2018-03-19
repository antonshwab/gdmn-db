import { Executor } from "./ADatabase";
import { AResultSet } from "./AResultSet";
export declare abstract class ATransaction<RS extends AResultSet> {
    /**
     * Example:
     * <pre><code>
     * const result2 = ATransaction.executeTransaction(transaction, {}, async (transaction) => {
     *      return await transaction.query("some sql");
     * })}
     * </code></pre>
     *
     * @param {T} transaction
     * @param {Executor<T extends ATransaction, R>} callback
     * @returns {Promise<R>}
     */
    static executeTransaction<RS extends AResultSet, T extends ATransaction<RS>, R>(transaction: T, callback: Executor<T, R>): Promise<R>;
    abstract start(): Promise<void>;
    abstract commit(): Promise<void>;
    abstract rollback(): Promise<void>;
    abstract isActive(): Promise<boolean>;
    abstract executeSQL(sql: string, params?: any[]): Promise<RS>;
}
