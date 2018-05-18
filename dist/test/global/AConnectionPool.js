"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const src_1 = require("../../src");
function connectionPoolTest(driver, dbOptions) {
    describe("AConnectionPool", async () => {
        it("lifecycle", async () => {
            const connectionPool = driver.newDefaultConnectionPool();
            await connectionPool.create(dbOptions, { min: 1, max: 1 });
            chai_1.expect(connectionPool.created).to.equal(true);
            await connectionPool.destroy();
            chai_1.expect(connectionPool.created).to.equal(false);
        });
        it("get connection", async () => {
            await src_1.AConnectionPool.executeConnectionPool({
                connectionPool: driver.newDefaultConnectionPool(),
                connectionOptions: dbOptions,
                options: { min: 1, max: 1 },
                callback: async (connectionPool) => {
                    const con1 = await connectionPool.get();
                    chai_1.expect(con1.connected).to.equal(true);
                    await con1.disconnect();
                    chai_1.expect(con1.connected).to.equal(false);
                    const con2 = await connectionPool.get();
                    chai_1.expect(con2.connected).to.equal(true);
                    await con2.disconnect();
                    chai_1.expect(con2.connected).to.equal(false);
                    chai_1.expect(con1).to.equal(con2);
                }
            });
        });
    });
}
exports.connectionPoolTest = connectionPoolTest;
//# sourceMappingURL=AConnectionPool.js.map