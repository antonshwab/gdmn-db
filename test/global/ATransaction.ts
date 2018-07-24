import {AConnection, AConnectionPool, IDefaultConnectionPoolOptions} from "../../src";

export function transactionTest(connectionPool: AConnectionPool<IDefaultConnectionPoolOptions>): void {
    describe("ATransaction", async () => {

        let globalConnection: AConnection;

        beforeAll(async () => {
            globalConnection = await connectionPool.get();
        });

        afterAll(async () => {
            await globalConnection.disconnect();
        });

        it("lifecycle", async () => {
            let transaction = await globalConnection.startTransaction();
            expect(transaction.finished).toBeFalsy();

            await transaction.commit();
            expect(transaction.finished).toBeTruthy();

            transaction = await globalConnection.startTransaction();
            expect(transaction.finished).toBeFalsy();

            await transaction.rollback();
            expect(transaction.finished).toBeTruthy();
        });
    });
}
