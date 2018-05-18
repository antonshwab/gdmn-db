"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const src_1 = require("../../src");
function connectionTest(driver, dbOptions) {
    describe("AConnection", async () => {
        it("lifecycle", async () => {
            const connection = driver.newConnection();
            await connection.connect(dbOptions);
            chai_1.expect(connection.connected).to.equal(true);
            await connection.disconnect();
            chai_1.expect(connection.connected).to.equal(false);
        });
        it("create connection", async () => {
            await src_1.AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: async (connection) => {
                    const transaction = await connection.startTransaction();
                    chai_1.should().exist(transaction);
                    chai_1.expect(transaction.finished).to.equal(false);
                    await transaction.commit();
                }
            });
        });
        it("prepare", async () => {
            await src_1.AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => src_1.AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => src_1.AConnection.executePrepareStatement({
                        connection, transaction,
                        sql: "SELECT FIRST 1 * FROM RDB$DATABASE",
                        callback: (statement) => chai_1.should().exist(statement)
                    })
                })
            });
        });
        it("execute", async () => {
            await src_1.AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => src_1.AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        const result = await connection.execute(transaction, "SELECT FIRST 1 * FROM RDB$DATABASE");
                        chai_1.should().not.exist(result);
                    }
                })
            });
        });
        it("execute with placeholder params", async () => {
            await src_1.AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => src_1.AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        const result = await connection.execute(transaction, "SELECT FIRST :count * FROM RDB$DATABASE", { count: 1 });
                        chai_1.should().not.exist(result);
                    }
                })
            });
        });
        it("execute with params", async () => {
            await src_1.AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => src_1.AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        const result = await connection.execute(transaction, "SELECT FIRST ? * FROM RDB$DATABASE", [1]);
                        chai_1.should().not.exist(result);
                    }
                })
            });
        });
        it("executeQuery", async () => {
            await src_1.AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => src_1.AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => src_1.AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: "SELECT FIRST 1 * FROM RDB$DATABASE",
                        callback: async (resultSet) => {
                            await resultSet.next();
                            chai_1.should().exist(resultSet);
                        }
                    })
                })
            });
        });
        it("executeQuery with placeholder params", async () => {
            await src_1.AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => src_1.AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => src_1.AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: "SELECT FIRST :count * FROM RDB$DATABASE",
                        params: { count: 1 },
                        callback: async (resultSet) => {
                            await resultSet.next();
                            chai_1.should().exist(resultSet);
                        }
                    })
                })
            });
        });
        it("executeQuery with params", async () => {
            await src_1.AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => src_1.AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => src_1.AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: "SELECT FIRST ? * FROM RDB$DATABASE",
                        params: [1],
                        callback: async (resultSet) => {
                            await resultSet.next();
                            chai_1.should().exist(resultSet);
                        }
                    })
                })
            });
        });
    });
}
exports.connectionTest = connectionTest;
//# sourceMappingURL=AConnection.js.map