import {expect} from "chai";
import {AConnectionPool, ADriver, IDBOptions} from "../../src";

export function connectionPoolTest(driver: ADriver, dbOptions: IDBOptions): void {
    describe("AConnectionPool", async () => {

        it("lifecycle", async () => {
            const connectionPool = driver.newDefaultConnectionPool();
            await connectionPool.create(dbOptions, {min: 1, max: 1});
            expect(await connectionPool.isCreated()).to.equal(true);

            await connectionPool.destroy();
            expect(await connectionPool.isCreated()).to.equal(false);
        });

        it("get database", async () => {
            await AConnectionPool.executeConnectionPool(
                driver.newDefaultConnectionPool(), dbOptions, {min: 1, max: 1},
                async (connectionPool) => {
                    const db1 = await connectionPool.get();
                    expect(await db1.isConnected()).to.equal(true);

                    await db1.disconnect();
                    expect(await db1.isConnected()).to.equal(false);

                    const db2 = await connectionPool.get();
                    expect(await db2.isConnected()).to.equal(true);

                    await db2.disconnect();
                    expect(await db2.isConnected()).to.equal(false);
                    expect(db1).to.equal(db2);
                });
        });
    });
}
