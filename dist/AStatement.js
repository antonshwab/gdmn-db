"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AResultSet_1 = require("./AResultSet");
class AStatement {
    static async executeFromParent(sourceCallback, resultCallback) {
        let statement;
        try {
            statement = await sourceCallback(null);
            return await resultCallback(statement);
        }
        finally {
            if (statement) {
                await statement.dispose();
            }
        }
    }
    /**
     * Example:
     * <pre>
     * const result = await AStatement.executeResultSet(statement, [param1, param2], async (resultSet) => {
     *      return await resultSet.getArrays();
     * })}
     * </pre>
     *
     * @param {TStatement} statement
     * @param {any[]} params
     * @param {TExecutor<TResultSet, R>} callback
     * @returns {Promise<any>}
     */
    static async executeResultSet(statement, params, callback) {
        return await AResultSet_1.AResultSet.executeFromParent(() => statement.executeQuery(params), callback);
    }
}
exports.AStatement = AStatement;
//# sourceMappingURL=AStatement.js.map