import {existsSync, unlinkSync} from "fs";
import {DefaultParamsAnalyzer, Factory, IConnectionOptions} from "../src";
import {Statement} from "../src/fb/Statement";
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

describe("Firebird driver tests", async () => {
    const globalConnectionPool = Factory.FBDriver.newDefaultConnectionPool();

    beforeAll(async () => {
        if (existsSync(path)) {
            unlinkSync(path);
        }
        const connection = Factory.FBDriver.newConnection();

        await connection.createDatabase(dbOptions);
        expect(connection.connected).toBeTruthy();

        await connection.disconnect();
        expect(connection.connected).toBeFalsy();

        await globalConnectionPool.create(dbOptions, {min: 1, max: 1});
        expect(globalConnectionPool.created).toBeTruthy();
    });

    afterAll(async () => {
        await globalConnectionPool.destroy();
        expect(globalConnectionPool.created).toBeFalsy();

        const connection = Factory.FBDriver.newConnection();

        await connection.connect(dbOptions);
        expect(connection.connected).toBeTruthy();

        await connection.dropDatabase();
        expect(connection.connected).toBeFalsy();
    });

    it(path + " exists", async () => {
        expect(existsSync(path)).toBeTruthy();
    });

    connectionTest(Factory.FBDriver, dbOptions);
    connectionPoolTest(Factory.FBDriver, dbOptions);

    transactionTest(globalConnectionPool);
    statementTest(globalConnectionPool);
    resultSetTest(globalConnectionPool);

    defaultParamsAnalyzerTest(Statement.EXCLUDE_PATTERNS, Statement.PLACEHOLDER_PATTERN);
});

function defaultParamsAnalyzerTest(excludePatterns: RegExp[], placeholderPattern: RegExp): void {
    describe("DefaultParamsAnalyzer", () => {

        it("simple sql query", () => {
            const sql =
                "SELECT * FROM TABLE\n" +
                "WHERE FIELD = :field_1\n" +
                "   OR FIELD = :field$2\n" +
                "   OR KEY = :field_1\n";
            const values = {
                field_1: "field1",
                field$2: "field2"
            };

            const analyzer = new DefaultParamsAnalyzer(sql, excludePatterns, placeholderPattern);
            expect(analyzer.sql).toEqual(
                "SELECT * FROM TABLE\n" +
                "WHERE FIELD = ?       \n" +
                "   OR FIELD = ?       \n" +
                "   OR KEY = ?       \n");
            expect(analyzer.prepareParams(values)).toEqual([values.field_1, values.field$2, values.field_1]);
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
            expect(analyzer.sql).toEqual(
                "SELECT * FROM TABLE --comment with :field\n" +
                "WHERE FIELD = /* comment with :field */?      \n" +
                "   OR FIELD = ?      \n");
            expect(analyzer.prepareParams(values)).toEqual([values.field1, values.field2]);
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
            expect(analyzer.sql).toEqual(
                "SELECT * FROM TABLE\n" +
                "WHERE FIELD = ?      \n" +
                "   OR FIELD = 'text :value text'\n");
            expect(analyzer.prepareParams(values)).toEqual([values.field1]);
        });

        it("execute block", () => {
            const sql =
                "EXECUTE BLOCK (id int = :id)\n" +
                "AS /*comment :id :key*/\n" +
                "BEGIN\n" +
                "   --comment :key --:id comment\n" +
                "   FOR SELECT * FROM TABLE\n" +
                "       WHERE ID = :id\n" +
                "   BEGIN\n" +
                "       --comment :key --:id comment\n" +
                "   END\n" +
                "end\n";
            const values = {
                id: "id"
            };

            const analyzer = new DefaultParamsAnalyzer(sql, excludePatterns, placeholderPattern);
            expect(analyzer.sql).toEqual(
                "EXECUTE BLOCK (id int = ?  )\n" +
                "AS /*comment :id :key*/\n" +
                "BEGIN\n" +
                "   --comment :key --:id comment\n" +
                "   FOR SELECT * FROM TABLE\n" +
                "       WHERE ID = :id\n" +
                "   BEGIN\n" +
                "       --comment :key --:id comment\n" +
                "   END\n" +
                "end\n");
            expect(analyzer.prepareParams(values)).toEqual([values.id]);
        });
    });
}
