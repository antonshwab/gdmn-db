import {expect} from "chai";
import {ParamsAnalyzer} from "../src/fb/ParamsAnalyzer";

describe("analysis sql query for the presence of named parameters", () => {

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

        const analyzer = new ParamsAnalyzer(sql);
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

        const analyzer = new ParamsAnalyzer(sql);
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

        const analyzer = new ParamsAnalyzer(sql);
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

        const analyzer = new ParamsAnalyzer(sql);
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
