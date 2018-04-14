import {should} from "chai";
import {AConnectionPool, ADatabase, ATransaction, IDefaultConnectionPoolOptions} from "../../src";

export function statementTest(connectionPool: AConnectionPool<IDefaultConnectionPoolOptions>): void {
    describe("AStatement", async () => {

        let globalDatabase: ADatabase;
        let globalTransaction: ATransaction;

        before(async () => {
            globalDatabase = await connectionPool.get();
            globalTransaction = await globalDatabase.createTransaction();
            await globalTransaction.start();
        });

        after(async () => {
            await globalTransaction.commit();
            await globalDatabase.disconnect();
        });

        it("lifecycle", async () => {
            const statement = await globalTransaction.prepare("SELECT FIRST 1 * FROM RDB$FIELDS");
            await statement.dispose();
        });

        it("execute", async () => {
            await ATransaction.executeStatement(globalTransaction, "SELECT FIRST 1 * FROM RDB$FIELDS",
                async (statement) => {
                    const result = await statement.execute();
                    should().not.exist(result);
                });
        });

        it("executeQuery", async () => {
            await ATransaction.executeStatement(globalTransaction, "SELECT FIRST 1 * FROM RDB$FIELDS",
                async (statement) => {
                    const resultSet = await statement.executeQuery();
                    should().exist(resultSet);

                    await resultSet.close();
                });
        });
    });
}
