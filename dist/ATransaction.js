"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AResultSet_1 = require("./AResultSet");
const AStatement_1 = require("./AStatement");
var AccessMode;
(function (AccessMode) {
    AccessMode[AccessMode["READ_WRITE"] = 0] = "READ_WRITE";
    AccessMode[AccessMode["READ_ONLY"] = 1] = "READ_ONLY";
})(AccessMode = exports.AccessMode || (exports.AccessMode = {}));
var Isolation;
(function (Isolation) {
    Isolation[Isolation["READ_COMMITED"] = 0] = "READ_COMMITED";
    Isolation[Isolation["READ_UNCOMMITED"] = 1] = "READ_UNCOMMITED";
    Isolation[Isolation["REPEATABLE_READ"] = 2] = "REPEATABLE_READ";
    Isolation[Isolation["SERIALIZABLE"] = 3] = "SERIALIZABLE";
})(Isolation = exports.Isolation || (exports.Isolation = {}));
/**
 * The transaction object
 */
class ATransaction {
    constructor(options = ATransaction.DEFAULT_OPTIONS) {
        this._options = options;
    }
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
     */
    static async executeStatement(transaction, sql, callback) {
        return await AStatement_1.AStatement.executeFromParent(() => transaction.prepare(sql), callback);
    }
    static async executeResultSet(transaction, sql, params, callback) {
        if (!callback) {
            callback = params;
        }
        return await AResultSet_1.AResultSet.executeFromParent(() => transaction.executeQuery(sql, params), callback);
    }
}
ATransaction.DEFAULT_OPTIONS = {
    isolation: Isolation.READ_COMMITED,
    accessMode: AccessMode.READ_WRITE
};
exports.ATransaction = ATransaction;
//# sourceMappingURL=ATransaction.js.map