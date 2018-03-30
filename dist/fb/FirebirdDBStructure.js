"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FirebirdTransaction_1 = require("./FirebirdTransaction");
const DBStructure_1 = require("../DBStructure");
const ADatabase_1 = require("../ADatabase");
const Factory_1 = require("../Factory");
class FirebirdDBStructure {
    static async readStructure(source) {
        if (source instanceof FirebirdTransaction_1.FirebirdTransaction) {
            return await FirebirdDBStructure.read(source);
        }
        return await ADatabase_1.ADatabase.executeTransaction(Factory_1.Factory.FBModule.newDatabase(), source, async (transaction) => {
            return await FirebirdDBStructure.read(transaction);
        });
    }
    static async read(transaction) {
        const fieldsSet = await transaction.executeSQL(`
                        SELECT 
                            TRIM(f.RDB$FIELD_NAME)                              AS RDB$FIELD_NAME,
                            f.RDB$FIELD_TYPE,
                            f.RDB$NULL_FLAG 
                        FROM RDB$FIELDS f
                    `);
        const fields = await fieldsSet.getObjects();
        const relationFieldsSet = await transaction.executeSQL(`
                        SELECT
                            TRIM(rf.RDB$RELATION_NAME)                          AS RDB$RELATION_NAME,
                            TRIM(rf.RDB$FIELD_NAME)                             AS RDB$FIELD_NAME,
                            TRIM(rf.RDB$FIELD_SOURCE)                           AS RDB$FIELD_SOURCE,
                            rf.RDB$NULL_FLAG
                        FROM RDB$RELATION_FIELDS rf
                        ORDER BY RDB$RELATION_NAME
                    `);
        const relationFields = await relationFieldsSet.getObjects();
        const constraintsSet = await transaction.executeSQL(`
                        SELECT
                            TRIM(rc.RDB$RELATION_NAME)                          AS RDB$RELATION_NAME,
                            TRIM(rc.RDB$CONSTRAINT_NAME)                        AS RDB$CONSTRAINT_NAME,
                            TRIM(CAST(rc.RDB$CONSTRAINT_TYPE AS CHAR(11)))      AS RDB$CONSTRAINT_TYPE,
                            s.RDB$FIELD_POSITION,
                            TRIM(s.RDB$INDEX_NAME)                              AS RDB$INDEX_NAME,
                            TRIM(s.RDB$FIELD_NAME)                              AS RDB$FIELD_NAME,
                            TRIM(rfc.RDB$CONST_NAME_UQ)                         AS RDB$CONST_NAME_UQ,
                            TRIM(CAST(rfc.RDB$UPDATE_RULE AS CHAR(11)))         AS RDB$UPDATE_RULE,
                            TRIM(CAST(rfc.RDB$DELETE_RULE AS CHAR(11)))         AS RDB$DELETE_RULE
                        FROM RDB$RELATION_CONSTRAINTS rc
                            JOIN RDB$INDEX_SEGMENTS s ON s.RDB$INDEX_NAME = rc.RDB$INDEX_NAME
                            LEFT JOIN RDB$REF_CONSTRAINTS rfc ON rfc.RDB$CONSTRAINT_NAME = rc.RDB$CONSTRAINT_NAME
                        ORDER BY rc.RDB$RELATION_NAME, rc.RDB$CONSTRAINT_NAME, s.RDB$FIELD_POSITION
                    `);
        const constraints = await constraintsSet.getObjects();
        const dbStructure = new DBStructure_1.DBStructure();
        dbStructure.load(fields, relationFields, constraints);
        return dbStructure;
    }
}
exports.FirebirdDBStructure = FirebirdDBStructure;
//# sourceMappingURL=FirebirdDBStructure.js.map