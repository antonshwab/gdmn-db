import {Executor} from "./ADatabase";

export type QuerySeqCallback = (row: any, index: number, next: () => void) => void

export abstract class ATransaction {

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
    static async executeTransaction<T extends ATransaction, R>(
        transaction: T,
        callback: Executor<T, R>
    ): Promise<R> {
        try {
            await transaction.start();
            const result = await callback(transaction);
            await transaction.commit();
            return result;
        } catch (error) {
            try {
                await transaction.rollback();
            } catch (error) {
                console.warn(error);
            }
            throw error;
        }
    }

    abstract async start(): Promise<void>;

    abstract async commit(): Promise<void>;

    abstract async rollback(): Promise<void>;

    abstract async isActive(): Promise<boolean>;

    abstract async query(query: string, params?: any[]): Promise<any[]>;

    abstract async querySequentially(query: string, callback: QuerySeqCallback, params?: any[]): Promise<void>;
}