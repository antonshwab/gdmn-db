"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const src_1 = require("../../src");
function statementTest(connectionPool) {
    describe("AStatement", async () => {
        let globalConnection;
        let globalTransaction;
        before(async () => {
            globalConnection = await connectionPool.get();
            globalTransaction = await globalConnection.startTransaction();
        });
        after(async () => {
            await globalTransaction.commit();
            await globalConnection.disconnect();
        });
        it("lifecycle", async () => {
            const statement = await globalConnection.prepare(globalTransaction, "SELECT FIRST 1 * FROM RDB$FIELDS");
            await statement.dispose();
        });
        it("execute", async () => {
            await src_1.AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST 1 * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const result = await statement.execute();
                    chai_1.should().not.exist(result);
                }
            });
        });
        it("execute with placeholder params", async () => {
            await src_1.AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST :count * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const result = await statement.execute({ count: 1 });
                    chai_1.should().not.exist(result);
                }
            });
        });
        it("execute with params", async () => {
            await src_1.AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST ? * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const result = await statement.execute([1]);
                    chai_1.should().not.exist(result);
                }
            });
        });
        it("executeQuery", async () => {
            await src_1.AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST 1 * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const resultSet = await statement.executeQuery();
                    chai_1.should().exist(resultSet);
                    await resultSet.close();
                }
            });
        });
        it("executeQuery with placeholder params", async () => {
            await src_1.AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST :count * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const resultSet = await statement.executeQuery({ count: 1 });
                    chai_1.should().exist(resultSet);
                    await resultSet.close();
                }
            });
        });
        it("executeQuery with params", async () => {
            await src_1.AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST ? * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const resultSet = await statement.executeQuery([1]);
                    chai_1.should().exist(resultSet);
                    await resultSet.close();
                }
            });
        });
    });
}
exports.statementTest = statementTest;
//# sourceMappingURL=AStatement.js.map