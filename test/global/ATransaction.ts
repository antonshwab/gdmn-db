import {expect} from "chai";
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
            let transaction = await globalConnection.startTransaction();
            expect(transaction.finished).to.equal(false);

            await transaction.commit();
            expect(transaction.finished).to.equal(true);

            transaction = await globalConnection.startTransaction();
            expect(transaction.finished).to.equal(false);

            await transaction.rollback();
            expect(transaction.finished).to.equal(true);
        });
    });
}
