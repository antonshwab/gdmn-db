import {ATransaction} from "../ATransaction";
import {AResultSet} from "../AResultSet";
import {FirebirdDatabase, FirebirdOptions} from "./FirebirdDatabase";
import {FirebirdTransaction} from "./FirebirdTransaction";
import {DBStructure} from "../DBStructure";

export class FirebirdDBStructure {

    static async readStructure(options: FirebirdOptions): Promise<DBStructure>;
    static async readStructure(transaction: FirebirdTransaction): Promise<DBStructure>;
    static async readStructure(source: FirebirdOptions | FirebirdTransaction): Promise<DBStructure> {
        if (source instanceof FirebirdTransaction) {
            return await FirebirdDBStructure.read(source);
        }

        return await FirebirdDatabase.executeTransaction(new FirebirdDatabase(), source, async transaction => {
            return await FirebirdDBStructure.read(transaction);
        });
    }

    private static async read(transaction: ATransaction<AResultSet>): Promise<DBStructure> {
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

        const dbStructure = new DBStructure();
        dbStructure.load(<any>fields, <any>relationFields, <any>constraints);

        return dbStructure;
    }
}