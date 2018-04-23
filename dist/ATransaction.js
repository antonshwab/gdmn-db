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
    static async executeSelf(selfReceiver, callback) {
        let self;
        try {
            self = await selfReceiver(null);
            const result = await callback(self);
            await self.commit();
            return result;
        }
        catch (error) {
            if (self) {
                await self.rollback();
            }
            throw error;
        }
    }
    /**
     * Example:
     * <pre>
     * const result = await ATransaction.executePrepareStatement(transaction, "some sql with params",
     *      async (statement) => {
     *          await statement.execute([param1, param2]);
     *          await statement.execute([param3, param4]);
     *          return "some value";
     *      })}
     * </pre>
     */
    static async executePrepareStatement(transaction, sql, callback) {
        return await AStatement_1.AStatement.executeSelf(() => transaction.prepare(sql), callback);
    }
    static async executeQueryResultSet(transaction, sql, params, callback) {
        if (!callback) {
            callback = params;
        }
        return await AResultSet_1.AResultSet.executeSelf(() => transaction.executeQuery(sql, params), callback);
    }
}
ATransaction.DEFAULT_OPTIONS = {
    isolation: Isolation.READ_COMMITED,
    accessMode: AccessMode.READ_WRITE
};
exports.ATransaction = ATransaction;
//# sourceMappingURL=ATransaction.js.map