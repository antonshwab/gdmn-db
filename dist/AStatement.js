"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AResultSet_1 = require("./AResultSet");
/**
 * An object that represents a precompiled SQL statement.
 * A SQL statement is precompiled and stored in a Statement object.
 * This object can then be used to efficiently execute this statement multiple times.
 */
class AStatement {
    static async executeSelf(selfReceiver, callback) {
        let self;
        try {
            self = await selfReceiver(null);
            return await callback(self);
        }
        finally {
            if (self) {
                await self.dispose();
            }
        }
    }
    static async executeQueryResultSet(statement, params, callback) {
        if (!callback) {
            callback = params;
        }
        return await AResultSet_1.AResultSet.executeSelf(() => statement.executeQuery(params), callback);
    }
}
exports.AStatement = AStatement;
//# sourceMappingURL=AStatement.js.map