"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADatabase_1 = require("../ADatabase");
const FirebirdTransaction2_1 = require("./FirebirdTransaction2");
const Factory_1 = require("../Factory");
const DBStructure_1 = require("../DBStructure");
class FirebirdDBStructure2 {
    static async readStructure(source) {
        if (source instanceof FirebirdTransaction2_1.FirebirdTransaction2) {
            return await FirebirdDBStructure2.read(source);
        }
        return await ADatabase_1.ADatabase.executeTransaction(Factory_1.Factory.FBModule2.newDatabase(), source, async (transaction) => {
            return await FirebirdDBStructure2.read(transaction);
        });
    }
    static async read(transaction) {
        const fieldsSet = await transaction.executeSQL(`
                        SELECT
                            TRIM(f.RDB$FIELD_NAME),
                            f.RDB$FIELD_TYPE,
                            f.RDB$NULL_FLAG 
                        FROM RDB$FIELDS f
                    `);
        const fields = [];
        while (await fieldsSet.next()) {
            fields.push({
                RDB$FIELD_NAME: fieldsSet.getString(0),
                RDB$FIELD_TYPE: fieldsSet.getNumber(1),
                RDB$NULL_FLAG: fieldsSet.getNumber(2)
            });
        }
        await fieldsSet.close();
        const relationFieldsSet = await transaction.executeSQL(`
                        SELECT
                            TRIM(rf.RDB$RELATION_NAME),
                            TRIM(rf.RDB$FIELD_NAME),
                            TRIM(rf.RDB$FIELD_SOURCE),
                            rf.RDB$NULL_FLAG
                        FROM RDB$RELATION_FIELDS rf
                        ORDER BY RDB$RELATION_NAME
                    `);
        const relationFields = [];
        while (await relationFieldsSet.next()) {
            relationFields.push({
                RDB$RELATION_NAME: relationFieldsSet.getString(0),
                RDB$FIELD_NAME: relationFieldsSet.getString(1),
                RDB$FIELD_SOURCE: relationFieldsSet.getString(2),
                RDB$NULL_FLAG: relationFieldsSet.getNumber(3)
            });
        }
        await relationFieldsSet.close();
        const constraintsSet = await transaction.executeSQL(`
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
                    `);
        const constraints = [];
        while (await constraintsSet.next()) {
            constraints.push({
                RDB$RELATION_NAME: constraintsSet.getString(0),
                RDB$CONSTRAINT_NAME: constraintsSet.getString(1),
                RDB$CONSTRAINT_TYPE: constraintsSet.getString(2),
                RDB$INDEX_NAME: constraintsSet.getString(3),
                RDB$FIELD_NAME: constraintsSet.getString(4),
                RDB$CONST_NAME_UQ: constraintsSet.getString(5),
                RDB$UPDATE_RULE: constraintsSet.getString(6),
                RDB$DELETE_RULE: constraintsSet.getString(7)
            });
        }
        await constraintsSet.close();
        const dbStructure = new DBStructure_1.DBStructure();
        dbStructure.load(fields, relationFields, constraints);
        return dbStructure;
    }
}
exports.FirebirdDBStructure2 = FirebirdDBStructure2;
//# sourceMappingURL=FirebirdDBStructure2.js.map