import {should} from "chai";
import {AConnection, AConnectionPool, ATransaction, IDefaultConnectionPoolOptions} from "../../src";

export function statementTest(connectionPool: AConnectionPool<IDefaultConnectionPoolOptions>): void {
    describe("AStatement", async () => {

        let globalConnection: AConnection;
        let globalTransaction: ATransaction;

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
            await AConnection.executePrepareStatement({
                connection: globalConnection,
                transaction: globalTransaction,
                sql: "SELECT FIRST 1 * FROM RDB$FIELDS",
                callback: async (statement) => {
                    const result = await statement.execute();
                    should().not.exist(result);
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
                    should().exist(resultSet);

                    await resultSet.close();
                }
            });
        });
    });
}
