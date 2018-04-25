import {expect} from "chai";
import {AConnectionPool, ADriver, IConnectionOptions} from "../../src";

export function connectionPoolTest(driver: ADriver, dbOptions: IConnectionOptions): void {
    describe("AConnectionPool", async () => {

        it("lifecycle", async () => {
            const connectionPool = driver.newDefaultConnectionPool();
            await connectionPool.create(dbOptions, {min: 1, max: 1});
            expect(await connectionPool.isCreated()).to.equal(true);

            await connectionPool.destroy();
            expect(await connectionPool.isCreated()).to.equal(false);
        });

        it("get connection", async () => {
            await AConnectionPool.executeConnectionPool(
                driver.newDefaultConnectionPool(), dbOptions, {min: 1, max: 1},
                async (connectionPool) => {
                    const con1 = await connectionPool.get();
                    expect(await con1.isConnected()).to.equal(true);

                    await con1.disconnect();
                    expect(await con1.isConnected()).to.equal(false);

                    const con2 = await connectionPool.get();
                    expect(await con2.isConnected()).to.equal(true);

                    await con2.disconnect();
                    expect(await con2.isConnected()).to.equal(false);
                    expect(con1).to.equal(con2);
                });
        });
    });
}
