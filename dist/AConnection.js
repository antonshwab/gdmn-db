"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AResultSet_1 = require("./AResultSet");
const AStatement_1 = require("./AStatement");
const ATransaction_1 = require("./ATransaction");
class AConnection {
    static async executeSelf(selfReceiver, callback) {
        let self;
        try {
            self = await selfReceiver(null);
            return await callback(self);
        }
        finally {
            if (self) {
                await self.disconnect();
            }
        }
    }
    static async executeConnection({ connection, callback, options }) {
        return await AConnection.executeSelf(async () => {
            await connection.connect(options);
            return connection;
        }, callback);
    }
    static async executeTransaction({ connection, callback, options }) {
        return await ATransaction_1.ATransaction.executeSelf(() => connection.startTransaction(options), callback);
    }
    static async executePrepareStatement({ connection, transaction, callback, sql }) {
        return await AStatement_1.AStatement.executeSelf(() => connection.prepare(transaction, sql), callback);
    }
    static async executeQueryResultSet({ connection, transaction, callback, sql, params, type }) {
        return await AResultSet_1.AResultSet.executeSelf(() => connection.executeQuery(transaction, sql, params), callback);
    }
}
exports.AConnection = AConnection;
//# sourceMappingURL=AConnection.js.map