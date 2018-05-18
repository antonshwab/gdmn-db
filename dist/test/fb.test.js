"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_1 = require("fs");
const src_1 = require("../src");
const Statement_1 = require("../src/fb/Statement");
const AConnection_1 = require("./global/AConnection");
const AConnectionPool_1 = require("./global/AConnectionPool");
const AResultSet_1 = require("./global/AResultSet");
const AStatement_1 = require("./global/AStatement");
const ATransaction_1 = require("./global/ATransaction");
exports.path = `${process.cwd()}/TEST.FDB`;
exports.dbOptions = {
    host: "localhost",
    port: 3050,
    username: "SYSDBA",
    password: "masterkey",
    path: exports.path
};
describe("Firebird driver tests", async function tests() {
    this.timeout(5000);
    const globalConnectionPool = src_1.Factory.FBDriver.newDefaultConnectionPool();
    before(async () => {
        if (fs_1.existsSync(exports.path)) {
            fs_1.unlinkSync(exports.path);
        }
        const connection = src_1.Factory.FBDriver.newConnection();
        await connection.createDatabase(exports.dbOptions);
        chai_1.expect(connection.connected).to.equal(true);
        await connection.disconnect();
        chai_1.expect(connection.connected).to.equal(false);
        await globalConnectionPool.create(exports.dbOptions, { min: 1, max: 1 });
        chai_1.expect(globalConnectionPool.created).to.equal(true);
    });
    after(async () => {
        await globalConnectionPool.destroy();
        chai_1.expect(globalConnectionPool.created).to.equal(false);
        const connection = src_1.Factory.FBDriver.newConnection();
        await connection.connect(exports.dbOptions);
        chai_1.expect(connection.connected).to.equal(true);
        await connection.dropDatabase();
        chai_1.expect(connection.connected).to.equal(false);
    });
    it(exports.path + " exists", async () => {
        chai_1.expect(fs_1.existsSync(exports.path)).to.equal(true);
    });
    AConnection_1.connectionTest(src_1.Factory.FBDriver, exports.dbOptions);
    AConnectionPool_1.connectionPoolTest(src_1.Factory.FBDriver, exports.dbOptions);
    ATransaction_1.transactionTest(globalConnectionPool);
    AStatement_1.statementTest(globalConnectionPool);
    AResultSet_1.resultSetTest(globalConnectionPool);
    defaultParamsAnalyzerTest(Statement_1.Statement.EXCLUDE_PATTERNS, Statement_1.Statement.PLACEHOLDER_PATTERN);
});
function defaultParamsAnalyzerTest(excludePatterns, placeholderPattern) {
    describe("DefaultParamsAnalyzer", () => {
        it("simple sql query", () => {
            const sql = "SELECT * FROM TABLE\n" +
                "WHERE FIELD = :field_1\n" +
                "   OR FIELD = :field$2\n" +
                "   OR KEY = :field_1\n";
            const values = {
                field_1: "field1",
                field$2: "field2"
            };
            const analyzer = new src_1.DefaultParamsAnalyzer(sql, excludePatterns, placeholderPattern);
            chai_1.expect(analyzer.sql).to.equal("SELECT * FROM TABLE\n" +
                "WHERE FIELD = ?       \n" +
                "   OR FIELD = ?       \n" +
                "   OR KEY = ?       \n");
            chai_1.expect(analyzer.prepareParams(values)).to.deep.equal([values.field_1, values.field$2, values.field_1]);
        });
        it("sql query with comments", () => {
            const sql = "SELECT * FROM TABLE --comment with :field\n" +
                "WHERE FIELD = /* comment with :field */:field1\n" +
                "   OR FIELD = :field2\n";
            const values = {
                field1: "field1",
                field2: "field2"
            };
            const analyzer = new src_1.DefaultParamsAnalyzer(sql, excludePatterns, placeholderPattern);
            chai_1.expect(analyzer.sql).to.equal("SELECT * FROM TABLE --comment with :field\n" +
                "WHERE FIELD = /* comment with :field */?      \n" +
                "   OR FIELD = ?      \n");
            chai_1.expect(analyzer.prepareParams(values)).to.deep.equal([values.field1, values.field2]);
        });
        it("sql query with value similar as named param", () => {
            const sql = "SELECT * FROM TABLE\n" +
                "WHERE FIELD = :field1\n" +
                "   OR FIELD = 'text :value text'\n";
            const values = {
                field1: "field1"
            };
            const analyzer = new src_1.DefaultParamsAnalyzer(sql, excludePatterns, placeholderPattern);
            chai_1.expect(analyzer.sql).to.equal("SELECT * FROM TABLE\n" +
                "WHERE FIELD = ?      \n" +
                "   OR FIELD = 'text :value text'\n");
            chai_1.expect(analyzer.prepareParams(values)).to.deep.equal([values.field1]);
        });
        it("execute block", () => {
            const sql = "EXECUTE BLOCK (id int = :id)\n" +
                "AS /*comment :id :key*/\n" +
                "BEGIN\n" +
                "   --comment :key --:id comment" +
                "   SELECT * FROM TABLE WHERE ID = :id" +
                "end\n";
            const values = {
                id: "id"
            };
            const analyzer = new src_1.DefaultParamsAnalyzer(sql, excludePatterns, placeholderPattern);
            chai_1.expect(analyzer.sql).to.equal("EXECUTE BLOCK (id int = ?  )\n" +
                "AS /*comment :id :key*/\n" +
                "BEGIN\n" +
                "   --comment :key --:id comment" +
                "   SELECT * FROM TABLE WHERE ID = :id" +
                "end\n");
            chai_1.expect(analyzer.prepareParams(values)).to.deep.equal([values.id]);
        });
    });
}
//# sourceMappingURL=fb.test.js.map