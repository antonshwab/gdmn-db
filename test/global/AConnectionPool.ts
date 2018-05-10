import {expect} from "chai";
import {AConnectionPool, ADriver, IConnectionOptions} from "../../src";

export function connectionPoolTest(driver: ADriver, dbOptions: IConnectionOptions): void {
    describe("AConnectionPool", async () => {

        it("lifecycle", async () => {
            const connectionPool = driver.newDefaultConnectionPool();
            await connectionPool.create(dbOptions, {min: 1, max: 1});
            expect(connectionPool.created).to.equal(true);

            await connectionPool.destroy();
            expect(connectionPool.created).to.equal(false);
        });

        it("get connection", async () => {
            await AConnectionPool.executeConnectionPool(
                driver.newDefaultConnectionPool(), dbOptions, {min: 1, max: 1},
                async (connectionPool) => {
                    const con1 = await connectionPool.get();
                    expect(con1.connected).to.equal(true);

                    await con1.disconnect();
                    expect(con1.connected).to.equal(false);

                    const con2 = await connectionPool.get();
                    expect(con2.connected).to.equal(true);

                    await con2.disconnect();
                    expect(con2.connected).to.equal(false);
                    expect(con1).to.equal(con2);
                });
        });
    });
}
