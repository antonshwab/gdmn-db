"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADatabase_1 = require("../ADatabase");
const ATransaction_1 = require("../ATransaction");
const DBStructure_1 = require("../DBStructure");
const Factory_1 = require("../Factory");
const FirebirdTransaction_1 = require("./FirebirdTransaction");
class FirebirdDBStructure {
    static async readStructure(source) {
        if (source instanceof FirebirdTransaction_1.FirebirdTransaction) {
            return await FirebirdDBStructure.read(source);
        }
        return await ADatabase_1.ADatabase.executeConnection(Factory_1.Factory.FBDriver.newDatabase(), source, async (database) => {
            return await ADatabase_1.ADatabase.executeTransaction(database, async (transaction) => {
                return await FirebirdDBStructure.read(transaction);
            });
        });
    }
    static async read(transaction) {
        const fields = await ATransaction_1.ATransaction.executeResultSet(transaction, `
            SELECT
                TRIM(f.RDB$FIELD_NAME),
                f.RDB$FIELD_TYPE,
                f.RDB$NULL_FLAG
            FROM RDB$FIELDS f
        `, async (resultSet) => {
            const array = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$FIELD_NAME: resultSet.getAny(0),
                    RDB$FIELD_TYPE: resultSet.getAny(1),
                    RDB$NULL_FLAG: resultSet.getAny(2)
                });
            }
            return array;
        });
        const relationFields = await ATransaction_1.ATransaction.executeResultSet(transaction, `
            SELECT
                TRIM(rf.RDB$RELATION_NAME),
                TRIM(rf.RDB$FIELD_NAME),
                TRIM(rf.RDB$FIELD_SOURCE),
                rf.RDB$NULL_FLAG
            FROM RDB$RELATION_FIELDS rf
            ORDER BY RDB$RELATION_NAME
        `, async (resultSet) => {
            const array = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$RELATION_NAME: resultSet.getAny(0),
                    RDB$FIELD_NAME: resultSet.getAny(1),
                    RDB$FIELD_SOURCE: resultSet.getAny(2),
                    RDB$NULL_FLAG: resultSet.getAny(3)
                });
            }
            return array;
        });
        const constraints = await ATransaction_1.ATransaction.executeResultSet(transaction, `
            SELECT
                TRIM(rc.RDB$RELATION_NAME),
                TRIM(rc.RDB$CONSTRAINT_NAME),
                TRIM(CAST(rc.RDB$CONSTRAINT_TYPE AS CHAR(11))),
                TRIM(s.RDB$INDEX_NAME),
                TRIM(s.RDB$FIELD_NAME),
                TRIM(rfc.RDB$CONST_NAME_UQ),
                TRIM(CAST(rfc.RDB$UPDATE_RULE AS CHAR(11))),
                TRIM(CAST(rfc.RDB$DELETE_RULE AS CHAR(11)))
            FROM RDB$RELATION_CONSTRAINTS rc
                JOIN RDB$INDEX_SEGMENTS s ON s.RDB$INDEX_NAME = rc.RDB$INDEX_NAME
                LEFT JOIN RDB$REF_CONSTRAINTS rfc ON rfc.RDB$CONSTRAINT_NAME = rc.RDB$CONSTRAINT_NAME
            ORDER BY rc.RDB$RELATION_NAME, rc.RDB$CONSTRAINT_NAME, s.RDB$FIELD_POSITION
        `, async (resultSet) => {
            const array = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$RELATION_NAME: resultSet.getAny(0),
                    RDB$CONSTRAINT_NAME: resultSet.getAny(1),
                    RDB$CONSTRAINT_TYPE: resultSet.getAny(2),
                    RDB$INDEX_NAME: resultSet.getAny(3),
                    RDB$FIELD_NAME: resultSet.getAny(4),
                    RDB$CONST_NAME_UQ: resultSet.getAny(5),
                    RDB$UPDATE_RULE: resultSet.getAny(6),
                    RDB$DELETE_RULE: resultSet.getAny(7)
                });
            }
            return array;
        });
        const dbStructure = new DBStructure_1.DBStructure();
        dbStructure.load(fields, relationFields, constraints);
        return dbStructure;
    }
}
exports.FirebirdDBStructure = FirebirdDBStructure;
//# sourceMappingURL=FirebirdDBStructure.js.map