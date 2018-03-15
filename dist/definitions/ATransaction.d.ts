import { Executor } from "./ADatabase";
export declare type QuerySeqCallback = (row: any, index: number, next: () => void) => void;
export default abstract class ATransaction {
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
    static executeTransaction<T extends ATransaction, R>(transaction: T, callback: Executor<T, R>): Promise<R>;
    abstract start(): Promise<void>;
    abstract commit(): Promise<void>;
    abstract rollback(): Promise<void>;
    abstract isActive(): Promise<boolean>;
    abstract query(query: string, params?: any[]): Promise<any[]>;
    abstract querySequentially(query: string, callback: QuerySeqCallback, params?: any[]): Promise<void>;
}
