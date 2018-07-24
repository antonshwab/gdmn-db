import {AConnection, AConnectionPool, ATransaction, IDefaultConnectionPoolOptions} from "../../src";

export function statementTest(connectionPool: AConnectionPool<IDefaultConnectionPoolOptions>): void {
    describe("AStatement", async () => {

        let globalConnection: AConnection;
        let globalTransaction: ATransaction;

        beforeAll(async () => {
            globalConnection = await connectionPool.get();
            globalTransaction = await globalConnection.startTransaction();
        });

        afterAll(async () => {
            await globalTransaction.commit();
            await globalConnection.disconnect();
        });

        it("lifecycle", async () => {
            const statement = await globalConnection.prepare(globalTransaction, "SELECT FIRST 1 * FROM RDB$FIELDS");
            await statement.dispose();
        });

        it("execute", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST 1 * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const result = await statement.execute();
                    expect(result).toBeFalsy();
                }
            });
        });

        it("execute with placeholder params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST :count * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const result = await statement.execute({count: 1});
                    expect(result).toBeFalsy();
                }
            });
        });

        it("execute with params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST ? * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const result = await statement.execute([1]);
                    expect(result).toBeFalsy();
                }
            });
        });

        it("executeQuery", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST 1 * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const resultSet = await statement.executeQuery();
                    expect(resultSet).toBeTruthy();

                    await resultSet.close();
                }
            });
        });

        it("executeQuery with placeholder params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST :count * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const resultSet = await statement.executeQuery({count: 1});
                    expect(resultSet).toBeTruthy();

                    await resultSet.close();
                }
            });
        });

        it("executeQuery with params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST ? * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const resultSet = await statement.executeQuery([1]);
                    expect(resultSet).toBeTruthy();

                    await resultSet.close();
                }
            });
        });

        it("executeReturning", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST 1 * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const result = await statement.executeReturning();
                    expect(result).toBeTruthy();
                }
            });
        });

        it("executeReturning with placeholder params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST :count * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const result = await statement.executeReturning({count: 1});
                    expect(result).toBeTruthy();
                }
            });
        });

        it("executeReturning with params", async () => {
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST ? * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const result = await statement.executeReturning([1]);
                    expect(result).toBeTruthy();
                }
            });
        });
    });
}
