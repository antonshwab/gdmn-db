import {AConnection} from "../AConnection";
import {ATransaction} from "../ATransaction";
import {DBStructure, IRDB$FIELD, IRDB$RELATIONCONSTRAINT, IRDB$RELATIONFIELD, NullFlag} from "../DBStructure";
import {ConstraintType, DeleteRule, UpdateRule} from "../DBStructure/DBStructure";
import {Factory} from "../Factory";
import {FirebirdOptions} from "./FirebirdConnection";
import {FirebirdTransaction} from "./FirebirdTransaction";

export class FirebirdDBStructure {

    /**
     * Execute database parent, execute parent and read the structure of database.
     *
     * @param {FirebirdOptions} options
     * @returns {Promise<DBStructure>}
     */
    public static async readStructure(options: FirebirdOptions): Promise<DBStructure>;
    /**
     * Read the structure of database.
     *
     * @param {FirebirdTransaction} transaction
     * @returns {Promise<DBStructure>}
     */
    public static async readStructure(transaction: FirebirdTransaction): Promise<DBStructure>;
    public static async readStructure(source: FirebirdOptions | FirebirdTransaction): Promise<DBStructure> {
        if (source instanceof FirebirdTransaction) {
            return await FirebirdDBStructure.read(source);
        }

        return await AConnection.executeConnection(Factory.FBDriver.newConnection(), source,
            async (connection) => {
                return await AConnection.executeTransaction(connection, async (transaction) => {
                    return await FirebirdDBStructure.read(transaction);
                });
            });
    }

    private static async read(transaction: ATransaction): Promise<DBStructure> {
        const fields = await ATransaction.executeQueryResultSet(transaction, `
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
        `, async (resultSet) => {
            const array: IRDB$FIELD[] = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$FIELD_NAME: resultSet.getString("fieldName"),
                    RDB$FIELD_TYPE: resultSet.getNumber("fieldType"),
                    RDB$NULL_FLAG: resultSet.getNumber("nullFlag") as NullFlag,
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
        });

        const relationFields = await ATransaction.executeQueryResultSet(transaction, `
            SELECT
                TRIM(rf.RDB$RELATION_NAME)      AS "relationName",
                TRIM(rf.RDB$FIELD_NAME)         AS "fieldName",
                TRIM(rf.RDB$FIELD_SOURCE)       AS "fieldSource",
                rf.RDB$NULL_FLAG                AS "nullFlag",
                rf.RDB$DEFAULT_VALUE            AS "defaultValue"
            FROM RDB$RELATION_FIELDS rf
            ORDER BY RDB$RELATION_NAME
        `, async (resultSet) => {
            const array: IRDB$RELATIONFIELD[] = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$RELATION_NAME: resultSet.getString("relationName"),
                    RDB$FIELD_NAME: resultSet.getString("fieldName"),
                    RDB$FIELD_SOURCE: resultSet.getString("fieldSource"),
                    RDB$NULL_FLAG: resultSet.getNumber("nullFlag") as NullFlag,
                    RDB$DEFAULT_VALUE: resultSet.isNull("defaultValue") ? null
                        : await resultSet.getBlob("defaultValue").asString()
                });
            }
            return array;
        });

        const constraints = await ATransaction.executeQueryResultSet(transaction, `
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
        `, async (resultSet) => {
            const array: IRDB$RELATIONCONSTRAINT[] = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$RELATION_NAME: resultSet.getString("relationName"),
                    RDB$CONSTRAINT_NAME: resultSet.getString("constraintName"),
                    RDB$CONSTRAINT_TYPE: resultSet.getString("constraintType") as ConstraintType,
                    RDB$INDEX_NAME: resultSet.getString("indexName"),
                    RDB$FIELD_NAME: resultSet.getString("fieldName"),
                    RDB$CONST_NAME_UQ: resultSet.getString("constNameUq"),
                    RDB$UPDATE_RULE: resultSet.getString("updateRule") as UpdateRule,
                    RDB$DELETE_RULE: resultSet.getString("deleteRule") as DeleteRule
                });
            }
            return array;
        });

        const dbStructure = new DBStructure();
        dbStructure.load(fields, relationFields, constraints);
        return dbStructure;
    }
}
