import {expect, should} from "chai";
import {AConnection, ADriver, IConnectionOptions} from "../../src";

export function connectionTest(driver: ADriver, dbOptions: IConnectionOptions): void {
    describe("AConnection", async () => {

        it("lifecycle", async () => {
            const connection = driver.newConnection();
            await connection.connect(dbOptions);
            expect(await connection.isConnected()).to.equal(true);

            await connection.disconnect();
            expect(await connection.isConnected()).to.equal(false);
        });

        it("create transaction", async () => {
            await AConnection.executeConnection(driver.newConnection(), dbOptions,
                async (connection) => {
                    const transaction = await connection.createTransaction();
                    should().exist(transaction);
                    expect(await transaction.isActive()).to.equal(false);
                });
        });
    });
}
