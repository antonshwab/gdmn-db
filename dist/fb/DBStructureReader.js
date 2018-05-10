"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AConnection_1 = require("../AConnection");
const DBStructure_1 = require("../DBStructure");
class DBStructureReader {
    /**
     * Read the structure of database.
     *
     * @param {Connection} connection
     * @param {Transaction} transaction
     * @returns {Promise<DBStructure>}
     */
    static async readStructure(connection, transaction) {
        if (transaction) {
            return await DBStructureReader.read(connection, transaction);
        }
        return await AConnection_1.AConnection.executeTransaction({
            connection,
            callback: (newTransaction) => DBStructureReader.read(connection, newTransaction)
        });
    }
    static async read(connection, transaction) {
        const fields = await AConnection_1.AConnection.executeQueryResultSet({
            connection,
            transaction,
            sql: `
                SELECT
                    TRIM(f.RDB$FIELD_NAME)          AS "fieldName",
                    f.RDB$FIELD_TYPE                AS "fieldType",
                    f.RDB$NULL_FLAG                 AS "nullFlag",
                    f.RDB$DEFAULT_VALUE             AS "defaultValue",
                    f.RDB$FIELD_LENGTH              AS "fieldLength",
                    f.RDB$FIELD_SCALE               AS "fieldScale",
                    f.RDB$VALIDATION_SOURCE         AS "validationSource",
                    f.RDB$FIELD_SUB_TYPE            AS "fieldSubType",
                    f.RDB$FIELD_PRECISION           AS "fieldPrecision"
                FROM RDB$FIELDS f
            `,
            callback: async (resultSet) => {
                const array = [];
                while (await resultSet.next()) {
                    array.push({
                        RDB$FIELD_NAME: resultSet.getString("fieldName"),
                        RDB$FIELD_TYPE: resultSet.getNumber("fieldType"),
                        RDB$NULL_FLAG: resultSet.getNumber("nullFlag"),
                        RDB$DEFAULT_VALUE: resultSet.isNull("defaultValue") ? null
                            : await resultSet.getBlob("defaultValue").asString(),
                        RDB$FIELD_LENGTH: resultSet.getNumber("fieldLength"),
                        RDB$FIELD_SCALE: resultSet.getNumber("fieldScale"),
                        RDB$VALIDATION_SOURCE: resultSet.isNull("validationSource") ? null
                            : await resultSet.getBlob("validationSource").asString(),
                        RDB$FIELD_SUB_TYPE: resultSet.isNull("fieldSubType") ? null
                            : resultSet.getNumber("fieldSubType"),
                        RDB$FIELD_PRECISION: resultSet.getNumber("fieldPrecision")
                    });
                }
                return array;
            }
        });
        const relationFields = await AConnection_1.AConnection.executeQueryResultSet({
            connection,
            transaction,
            sql: `
                SELECT
                    TRIM(rf.RDB$RELATION_NAME)      AS "relationName",
                    TRIM(rf.RDB$FIELD_NAME)         AS "fieldName",
                    TRIM(rf.RDB$FIELD_SOURCE)       AS "fieldSource",
                    rf.RDB$NULL_FLAG                AS "nullFlag",
                    rf.RDB$DEFAULT_VALUE            AS "defaultValue"
                FROM RDB$RELATION_FIELDS rf
                ORDER BY RDB$RELATION_NAME, RDB$FIELD_POSITION
            `,
            callback: async (resultSet) => {
                const array = [];
                while (await resultSet.next()) {
                    array.push({
                        RDB$RELATION_NAME: resultSet.getString("relationName"),
                        RDB$FIELD_NAME: resultSet.getString("fieldName"),
                        RDB$FIELD_SOURCE: resultSet.getString("fieldSource"),
                        RDB$NULL_FLAG: resultSet.getNumber("nullFlag"),
                        RDB$DEFAULT_VALUE: resultSet.isNull("defaultValue") ? null
                            : await resultSet.getBlob("defaultValue").asString()
                    });
                }
                return array;
            }
        });
        const constraints = await AConnection_1.AConnection.executeQueryResultSet({
            connection,
            transaction,
            sql: `
                SELECT
                    TRIM(rc.RDB$RELATION_NAME)      AS "relationName",
                    TRIM(rc.RDB$CONSTRAINT_NAME)    AS "constraintName",
                    TRIM(rc.RDB$CONSTRAINT_TYPE)    AS "constraintType",
                   TRIM(s.RDB$INDEX_NAME)          AS "indexName",
                   TRIM(s.RDB$FIELD_NAME)          AS "fieldName",
                   TRIM(rfc.RDB$CONST_NAME_UQ)     AS "constNameUq",
                   TRIM(rfc.RDB$UPDATE_RULE)       AS "updateRule",
                    TRIM(rfc.RDB$DELETE_RULE)       AS "deleteRule"
                FROM RDB$RELATION_CONSTRAINTS rc
                   JOIN RDB$INDEX_SEGMENTS s ON s.RDB$INDEX_NAME = rc.RDB$INDEX_NAME
                   LEFT JOIN RDB$REF_CONSTRAINTS rfc ON rfc.RDB$CONSTRAINT_NAME = rc.RDB$CONSTRAINT_NAME
                ORDER BY rc.RDB$RELATION_NAME, rc.RDB$CONSTRAINT_NAME, s.RDB$FIELD_POSITION
            `,
            callback: async (resultSet) => {
                const array = [];
                while (await resultSet.next()) {
                    array.push({
                        RDB$RELATION_NAME: resultSet.getString("relationName"),
                        RDB$CONSTRAINT_NAME: resultSet.getString("constraintName"),
                        RDB$CONSTRAINT_TYPE: resultSet.getString("constraintType"),
                        RDB$INDEX_NAME: resultSet.getString("indexName"),
                        RDB$FIELD_NAME: resultSet.getString("fieldName"),
                        RDB$CONST_NAME_UQ: resultSet.getString("constNameUq"),
                        RDB$UPDATE_RULE: resultSet.getString("updateRule"),
                        RDB$DELETE_RULE: resultSet.getString("deleteRule")
                    });
                }
                return array;
            }
        });
        const dbStructure = new DBStructure_1.DBStructure();
        dbStructure.load(fields, relationFields, constraints);
        return dbStructure;
    }
}
exports.DBStructureReader = DBStructureReader;
//# sourceMappingURL=DBStructureReader.js.map