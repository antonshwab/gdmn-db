import {expect, should} from "chai";
import {AConnectionPool, ADatabase, IDefaultConnectionPoolOptions} from "../../src";

export function transactionTest(connectionPool: AConnectionPool<IDefaultConnectionPoolOptions>): void {
    describe("ATransaction", async () => {

        let globalDatabase: ADatabase;

        before(async () => {
            globalDatabase = await connectionPool.get();
        });

        after(async () => {
            await globalDatabase.disconnect();
        });

        it("lifecycle", async () => {
            const transaction = await globalDatabase.createTransaction();
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
            await ADatabase.executeTransaction(globalDatabase, async (transaction) => {
                const statement = await transaction.prepare("SELECT FIRST 1 * FROM RDB$FIELDS");
                should().exist(statement);

                await statement.dispose();
            });
        });

        it("execute", async () => {
            await ADatabase.executeTransaction(globalDatabase, async (transaction) => {
                const result = await transaction.execute("SELECT FIRST 1 * FROM RDB$FIELDS");
                should().not.exist(result);
            });
        });

        it("executeQuery", async () => {
            await ADatabase.executeTransaction(globalDatabase, async (transaction) => {
                const resultSet = await transaction.executeQuery("SELECT FIRST 1 * FROM RDB$FIELDS");
                should().exist(resultSet);

                await resultSet.close();
            });
        });
    });
}
