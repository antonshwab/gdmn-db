"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AStatement_1 = require("./AStatement");
const AResultSet_1 = require("./AResultSet");
class ATransaction {
    static async executeFromParent(sourceCallback, resultCallback) {
        let transaction;
        try {
            transaction = await sourceCallback(null);
            const result = await resultCallback(transaction);
            await transaction.commit();
            return result;
        }
        catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }
    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executeStatement(transaction, "some sql with params", async (statement) => {
     *      await statement.execute([param1, param2]);
     *      await statement.execute([param3, param4]);
     *      return "some value";
     * })}
     * </pre>
     *
     * @param {TTransaction} transaction
     * @param {string} sql
     * @param {TExecutor<TStatement, R>} callback
     * @returns {Promise<R>}
     */
    static async executeStatement(transaction, sql, callback) {
        return await AStatement_1.AStatement.executeFromParent(() => transaction.prepareSQL(sql), callback);
    }
    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executeResultSet(transaction, "some sql", [param1, param2], async (resultSet) => {
     *      return await resultSet.getArrays();
     * })}
     * </pre>
     *
     * @param {TTransaction} transaction
     * @param {string} sql
     * @param {any[]} params
     * @param {TExecutor<TResultSet, R>} callback
     * @returns {Promise<R>}
     */
    static async executeResultSet(transaction, sql, params = [], callback) {
        return await AResultSet_1.AResultSet.executeFromParent(() => transaction.executeSQL(sql, params), callback);
    }
}
exports.ATransaction = ATransaction;
//# sourceMappingURL=ATransaction.js.map