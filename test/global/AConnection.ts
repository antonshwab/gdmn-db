import {expect, should} from "chai";
import {AConnection, ADriver, IConnectionOptions} from "../../src";

export function connectionTest(driver: ADriver, dbOptions: IConnectionOptions): void {
    describe("AConnection", async () => {

        it("lifecycle", async () => {
            const connection = driver.newConnection();
            await connection.connect(dbOptions);
            expect(connection.connected).to.equal(true);

            await connection.disconnect();
            expect(connection.connected).to.equal(false);
        });

        it("create connection", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: async (connection) => {
                    const transaction = await connection.startTransaction();
                    should().exist(transaction);
                    expect(transaction.finished).to.equal(false);
                    await transaction.commit();
                }
            });
        });

        it("prepare", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => AConnection.executePrepareStatement({
                        connection, transaction,
                        sql: "SELECT FIRST 1 * FROM RDB$DATABASE",
                        callback: (statement) => should().exist(statement)
                    })
                })
            });
        });

        it("execute", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        const result = await connection.execute(transaction, "SELECT FIRST 1 * FROM RDB$DATABASE");
                        should().not.exist(result);
                    }
                })
            });
        });

        it("execute with placeholder params", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        const result = await connection.execute(transaction,
                            "SELECT FIRST :count * FROM RDB$DATABASE", {count: 1});
                        should().not.exist(result);
                    }
                })
            });
        });

        it("execute with params", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: async (transaction) => {
                        const result = await connection.execute(transaction,
                            "SELECT FIRST ? * FROM RDB$DATABASE", [1]);
                        should().not.exist(result);
                    }
                })
            });
        });

        it("executeQuery", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: "SELECT FIRST 1 * FROM RDB$DATABASE",
                        callback: async (resultSet) => {
                            await resultSet.next();
                            should().exist(resultSet);
                        }
                    })
                })
            });
        });

        it("executeQuery with placeholder params", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: "SELECT FIRST :count * FROM RDB$DATABASE",
                        params: {count: 1},
                        callback: async (resultSet) => {
                            await resultSet.next();
                            should().exist(resultSet);
                        }
                    })
                })
            });
        });

        it("executeQuery with params", async () => {
            await AConnection.executeConnection({
                connection: driver.newConnection(),
                options: dbOptions,
                callback: (connection) => AConnection.executeTransaction({
                    connection,
                    callback: (transaction) => AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: "SELECT FIRST ? * FROM RDB$DATABASE",
                        params: [1],
                        callback: async (resultSet) => {
                            await resultSet.next();
                            should().exist(resultSet);
                        }
                    })
                })
            });
        });
    });
}
