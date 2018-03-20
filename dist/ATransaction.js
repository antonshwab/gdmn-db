"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ATransaction {
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
    static async executeTransaction(transaction, callback) {
        try {
            await transaction.start();
            const result = await callback(transaction);
            await transaction.commit();
            return result;
        }
        catch (error) {
            try {
                await transaction.rollback();
            }
            catch (error) {
                console.warn(error);
            }
            throw error;
        }
    }
}
exports.ATransaction = ATransaction;
//# sourceMappingURL=ATransaction.js.map