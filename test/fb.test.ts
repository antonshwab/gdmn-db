import {expect} from "chai";
import {existsSync, unlinkSync} from "fs";
import {DefaultParamsAnalyzer, Factory, IConnectionOptions} from "../src";
import {FirebirdTransaction} from "../src/fb/FirebirdTransaction";
import {connectionTest} from "./global/AConnection";
import {connectionPoolTest} from "./global/AConnectionPool";
import {resultSetTest} from "./global/AResultSet";
import {statementTest} from "./global/AStatement";
import {transactionTest} from "./global/ATransaction";

export const path = `${process.cwd()}/TEST.FDB`;
export const dbOptions: IConnectionOptions = {
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
        const connection = Factory.FBDriver.newConnection();

        await connection.createDatabase(dbOptions);
        expect(await connection.isConnected()).to.equal(true);

        await connection.disconnect();
        expect(await connection.isConnected()).to.equal(false);

        await globalConnectionPool.create(dbOptions, {min: 1, max: 1});
        expect(await globalConnectionPool.isCreated()).to.equal(true);
    });

    after(async () => {
        await globalConnectionPool.destroy();
        expect(await globalConnectionPool.isCreated()).to.equal(false);

        const connection = Factory.FBDriver.newConnection();

        await connection.connect(dbOptions);
        expect(await connection.isConnected()).to.equal(true);

        await connection.dropDatabase();
        expect(await connection.isConnected()).to.equal(false);
    });

    it(path + " exists", async () => {
        expect(existsSync(path)).to.equal(true);
    });

    connectionTest(Factory.FBDriver, dbOptions);
    connectionPoolTest(Factory.FBDriver, dbOptions);

    transactionTest(globalConnectionPool);
    statementTest(globalConnectionPool);
    resultSetTest(globalConnectionPool);

    defaultParamsAnalyzerTest(FirebirdTransaction.EXCLUDE_PATTERNS, FirebirdTransaction.PLACEHOLDER_PATTERN);
});

function defaultParamsAnalyzerTest(excludePatterns: RegExp[], placeholderPattern: RegExp): void {
    describe("DefaultParamsAnalyzer", () => {

        it("simple sql query", () => {
            const sql =
                "SELECT * FROM TABLE\n" +
                "WHERE FIELD = :field1\n" +
                "   OR FIELD = :field2\n" +
                "   OR KEY = :field1\n";
            const values = {
                field1: "field1",
                field2: "field2"
            };

            const analyzer = new DefaultParamsAnalyzer(sql, excludePatterns, placeholderPattern);
            expect(analyzer.sql).to.equal(
                "SELECT * FROM TABLE\n" +
                "WHERE FIELD = ?      \n" +
                "   OR FIELD = ?      \n" +
                "   OR KEY = ?      \n");
            expect(analyzer.prepareParams(values)).to.deep.equal([values.field1, values.field2, values.field1]);
        });

        it("sql query with comments", () => {
            const sql =
                "SELECT * FROM TABLE --comment with :field\n" +
                "WHERE FIELD = /* comment with :field */:field1\n" +
                "   OR FIELD = :field2\n";
            const values = {
                field1: "field1",
                field2: "field2"
            };

            const analyzer = new DefaultParamsAnalyzer(sql, excludePatterns, placeholderPattern);
            expect(analyzer.sql).to.equal(
                "SELECT * FROM TABLE --comment with :field\n" +
                "WHERE FIELD = /* comment with :field */?      \n" +
                "   OR FIELD = ?      \n");
            expect(analyzer.prepareParams(values)).to.deep.equal([values.field1, values.field2]);
        });

        it("sql query with value similar as named param", () => {
            const sql =
                "SELECT * FROM TABLE\n" +
                "WHERE FIELD = :field1\n" +
                "   OR FIELD = 'text :value text'\n";
            const values = {
                field1: "field1"
            };

            const analyzer = new DefaultParamsAnalyzer(sql, excludePatterns, placeholderPattern);
            expect(analyzer.sql).to.equal(
                "SELECT * FROM TABLE\n" +
                "WHERE FIELD = ?      \n" +
                "   OR FIELD = 'text :value text'\n");
            expect(analyzer.prepareParams(values)).to.deep.equal([values.field1]);
        });

        it("execute block", () => {
            const sql =
                "EXECUTE BLOCK (id int = :id)\n" +
                "AS /*comment :id :key*/\n" +
                "BEGIN\n" +
                "   --comment :key --:id comment" +
                "   SELECT * FROM TABLE WHERE ID = :id" +
                "end\n";
            const values = {
                id: "id"
            };

            const analyzer = new DefaultParamsAnalyzer(sql, excludePatterns, placeholderPattern);
            expect(analyzer.sql).to.equal(
                "EXECUTE BLOCK (id int = ?  )\n" +
                "AS /*comment :id :key*/\n" +
                "BEGIN\n" +
                "   --comment :key --:id comment" +
                "   SELECT * FROM TABLE WHERE ID = :id" +
                "end\n");
            expect(analyzer.prepareParams(values)).to.deep.equal([values.id]);
        });
    });
}
