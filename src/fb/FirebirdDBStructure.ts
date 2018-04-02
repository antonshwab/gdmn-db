import {ADatabase} from "../ADatabase";
import {TTransaction} from "../ATransaction";
import {FirebirdOptions} from "./FirebirdDatabase";
import {FirebirdTransaction} from "./FirebirdTransaction";
import {Factory} from "../Factory";
import {DBStructure, IRDB$FIELD, IRDB$RELATIONCONSTRAINT, IRDB$RELATIONFIELD} from "../DBStructure";

export class FirebirdDBStructure {

    static async readStructure(options: FirebirdOptions): Promise<DBStructure>;
    static async readStructure(transaction: FirebirdTransaction): Promise<DBStructure>;
    static async readStructure(source: FirebirdOptions | FirebirdTransaction): Promise<DBStructure> {
        if (source instanceof FirebirdTransaction) {
            return await FirebirdDBStructure.read(source);
        }

        return await ADatabase.executeTransaction(Factory.FBModule.newDatabase(), source,
            async transaction => {
                return await FirebirdDBStructure.read(transaction);
            });
    }

    private static async read(transaction: TTransaction): Promise<DBStructure> {
        const fieldsSet = await transaction.executeSQL(`
                        SELECT
                            TRIM(f.RDB$FIELD_NAME),
                            f.RDB$FIELD_TYPE,
                            f.RDB$NULL_FLAG 
                        FROM RDB$FIELDS f
                    `);
        const fields: IRDB$FIELD[] = [];
        while (await fieldsSet.next()) {
            fields.push({
                RDB$FIELD_NAME: fieldsSet.getAny(0),
                RDB$FIELD_TYPE: fieldsSet.getAny(1),
                RDB$NULL_FLAG: fieldsSet.getAny(2)
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
        const relationFields: IRDB$RELATIONFIELD[] = [];
        while (await relationFieldsSet.next()) {
            relationFields.push({
                RDB$RELATION_NAME: relationFieldsSet.getAny(0),
                RDB$FIELD_NAME: relationFieldsSet.getAny(1),
                RDB$FIELD_SOURCE: relationFieldsSet.getAny(2),
                RDB$NULL_FLAG: relationFieldsSet.getAny(3)
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
        const constraints: IRDB$RELATIONCONSTRAINT[] = [];
        while (await constraintsSet.next()) {
            constraints.push({
                RDB$RELATION_NAME: constraintsSet.getAny(0),
                RDB$CONSTRAINT_NAME: constraintsSet.getAny(1),
                RDB$CONSTRAINT_TYPE: constraintsSet.getAny(2),
                RDB$INDEX_NAME: constraintsSet.getAny(3),
                RDB$FIELD_NAME: constraintsSet.getAny(4),
                RDB$CONST_NAME_UQ: constraintsSet.getAny(5),
                RDB$UPDATE_RULE: constraintsSet.getAny(6),
                RDB$DELETE_RULE: constraintsSet.getAny(7)
            });
        }
        await constraintsSet.close();

        const dbStructure = new DBStructure();
        dbStructure.load(fields, relationFields, constraints);
        return dbStructure;
    }
}