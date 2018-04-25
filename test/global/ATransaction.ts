import {expect, should} from "chai";
import {AConnection, AConnectionPool, IDefaultConnectionPoolOptions} from "../../src";

export function transactionTest(connectionPool: AConnectionPool<IDefaultConnectionPoolOptions>): void {
    describe("ATransaction", async () => {

        let globalConnection: AConnection;

        before(async () => {
            globalConnection = await connectionPool.get();
        });

        after(async () => {
            await globalConnection.disconnect();
        });

        it("lifecycle", async () => {
            const transaction = await globalConnection.createTransaction();
            expect(await transaction.isActive()).to.equal(false);

            await transaction.start();
            expect(await transaction.isActive()).to.equal(true);

            await transaction.commit();
            expect(await transaction.isActive()).to.equal(false);

            await transaction.start();
            expect(await transaction.isActive()).to.equal(true);

            await transaction.rollback();
            expect(await transaction.isActive()).to.equal(false);
        });

        it("prepare", async () => {
            await AConnection.executeTransaction(globalConnection, async (transaction) => {
                const statement = await transaction.prepare("SELECT FIRST 1 * FROM RDB$FIELDS");
                should().exist(statement);

                await statement.dispose();
            });
        });

        it("execute", async () => {
            await AConnection.executeTransaction(globalConnection, async (transaction) => {
                const result = await transaction.execute("SELECT FIRST 1 * FROM RDB$FIELDS");
                should().not.exist(result);
            });
        });

        it("executeQuery", async () => {
            await AConnection.executeTransaction(globalConnection, async (transaction) => {
                const resultSet = await transaction.executeQuery("SELECT FIRST 1 * FROM RDB$FIELDS");
                should().exist(resultSet);

                await resultSet.close();
            });
        });
    });
}
