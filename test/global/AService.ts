import { ADriver, AConnection, IConnectionOptions } from "../../src";
import path from "path";
import * as fs from "fs";
import { populateDb } from "../fixtures/populateDb";
import { AService } from "../../src/AService";

export function serviceTest(driver: ADriver): void {
    describe("AServiceManager", async () => {
        const cwd = `${process.cwd()}`;
        const fixturesPath = path.join(cwd, "test", "fixtures");

        const testDbPath = path.join(fixturesPath, "test_db.FDB");
        const backupTestDbPath = path.join(fixturesPath, "test_db_backup.fbk");
        const restoredTestDbPath = path.join(fixturesPath, "restored_test_db.FDB");

        const dbOptions: IConnectionOptions = {
            host: "localhost",
            port: 3050,
            username: "SYSDBA",
            password: "masterkey",
            path: testDbPath,
        };

        const restoredDbOptions = { ...dbOptions, path: restoredTestDbPath };

        let fixtureArrayData;

        beforeAll(async () => {
            if (fs.existsSync(testDbPath)) {
                fs.unlinkSync(testDbPath);
            }

            fixtureArrayData = await populateDb(dbOptions, 1000);

            if (fs.existsSync(backupTestDbPath)) {
                fs.unlinkSync(backupTestDbPath);
            }

            if (fs.existsSync(restoredTestDbPath)) {
                fs.unlinkSync(restoredTestDbPath);
            }

        });

        it("backup/restore", async () => {
            const svcManager: AService = driver.newService();

            try {
                await svcManager.attachService(dbOptions);
            } catch (error) {
                console.error(error);
            }

            try {
                await svcManager.backupDatabase(dbOptions.path, backupTestDbPath);
            } catch (error) {
                console.error(error);
            }

            expect(fs.existsSync(backupTestDbPath)).toBeTruthy();

            try {
                await svcManager.restoreDatabase(restoredTestDbPath, backupTestDbPath);
            } catch (error) {
                console.error(error);
            } finally {
                await svcManager.detachService();
            }

            expect(fs.existsSync(restoredTestDbPath)).toBeTruthy();

            const connection = driver.newConnection();
            await AConnection.executeConnection({
                connection,
                options: restoredDbOptions,
                callback: (_connection) => AConnection.executeTransaction({
                    connection: _connection,
                    callback: (transaction) => AConnection.executeQueryResultSet({
                        connection,
                        transaction,
                        sql: "SELECT * FROM TEST_TABLE",
                        callback: async (resultSet) => {
                            for (let i = 0; await resultSet.next(); i++) {
                                const dataItem = fixtureArrayData[i];
                                const result = await resultSet.getAll();
                                expect(result[0]).toEqual(dataItem.id);
                                expect(result[1]).toEqual(dataItem.name);
                                expect(result[2].getTime()).toEqual(dataItem.dateTime.getTime());
                                expect(result[3].getTime()).toEqual(dataItem.onlyDate.getTime());
                                expect(result[4].getTime()).toEqual(dataItem.onlyTime.getTime());
                                expect(result[5]).toBeNull();
                                expect(result[6]).toEqual(dataItem.textBlob);
                            }
                        }
                    })
                })
            });

        });

    });
}
