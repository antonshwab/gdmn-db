import {expect, should} from "chai";
import {ADatabase, ADriver, IDBOptions} from "../../src";

export function databaseTest(driver: ADriver<any>, dbOptions: IDBOptions): void {
    describe("ADatabase", async () => {

        it("lifecycle", async () => {
            const database = driver.newDatabase();
            await database.connect(dbOptions);
            expect(await database.isConnected()).to.equal(true);

            await database.disconnect();
            expect(await database.isConnected()).to.equal(false);
        });

        it("create transaction", async () => {
            await ADatabase.executeConnection(driver.newDatabase(), dbOptions,
                async (database) => {
                    const transaction = await database.createTransaction();
                    should().exist(transaction);
                    expect(await transaction.isActive()).to.equal(false);
                });
        });
    });
}
