import {TExecutor} from "./ADatabase";
import {AResultSet} from "./AResultSet";

export type TTransaction = ATransaction<AResultSet>;

export abstract class ATransaction<RS extends AResultSet> {

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
    static async executeTransaction<R>(
        transaction: TTransaction,
        callback: TExecutor<TTransaction, R>
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

    abstract async executeSQL(sql: string, params?: any[]): Promise<RS>;
}