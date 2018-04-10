import {expect} from "chai";
import {existsSync, unlinkSync} from "fs";
import {Factory, FirebirdTransaction, IDBOptions} from "../src";
import {connectionPoolTest} from "./global/AConnectionPool";
import {databaseTest} from "./global/ADatabase";
import {resultSetTest} from "./global/AResultSet";
import {statementTest} from "./global/AStatement";
import {transactionTest} from "./global/ATransaction";
import {defaultParamsAnalyzerTest} from "./global/DefaultParamsAnalyzer";

export const path = `${process.cwd()}/TEST.FDB`;
export const dbOptions: IDBOptions = {
    host: "localhost",
    port: 3050,
    username: "SYSDBA",
    password: "masterkey",
    path
};

describe("Firebird driver tests", async function tests(): Promise<void> {
    this.timeout(5000);

    const globalConnectionPool = Factory.FBDriver.newDefaultConnectionPool();

    before(async () => {
        if (existsSync(path)) {
            unlinkSync(path);
        }
        const database = Factory.FBDriver.newDatabase();

        await database.createDatabase(dbOptions);
        expect(await database.isConnected()).to.equal(true);

        await database.disconnect();
        expect(await database.isConnected()).to.equal(false);

        await globalConnectionPool.create(dbOptions, {min: 1, max: 1});
        expect(await globalConnectionPool.isCreated()).to.equal(true);
    });

    after(async () => {
        await globalConnectionPool.destroy();
        expect(await globalConnectionPool.isCreated()).to.equal(false);

        const database = Factory.FBDriver.newDatabase();

        await database.connect(dbOptions);
        expect(await database.isConnected()).to.equal(true);

        await database.dropDatabase();
        expect(await database.isConnected()).to.equal(false);
    });

    it(path + " exists", async () => {
        expect(existsSync(path)).to.equal(true);
    });

    databaseTest(Factory.FBDriver, dbOptions);
    connectionPoolTest(Factory.FBDriver, dbOptions);

    transactionTest(globalConnectionPool);
    statementTest(globalConnectionPool);
    resultSetTest(globalConnectionPool);

    defaultParamsAnalyzerTest(FirebirdTransaction._EXCLUDE_PATTERNS, FirebirdTransaction._PLACEHOLDER_PATTERN);
});
