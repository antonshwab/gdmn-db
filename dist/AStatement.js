"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AResultSet_1 = require("./AResultSet");
/**
 * An object that represents a precompiled SQL statement.
 * A SQL statement is precompiled and stored in a Statement object.
 * This object can then be used to efficiently execute this statement multiple times.
 */
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
    static async executeResultSet(statement, params, callback) {
        if (!callback) {
            callback = params;
        }
        return await AResultSet_1.AResultSet.executeFromParent(() => statement.executeQuery(params), callback);
    }
}
exports.AStatement = AStatement;
//# sourceMappingURL=AStatement.js.map