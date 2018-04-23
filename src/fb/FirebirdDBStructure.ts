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
                TRIM(f.RDB$FIELD_NAME),
                f.RDB$FIELD_TYPE,
                f.RDB$NULL_FLAG,
                f.RDB$DEFAULT_VALUE,
                f.RDB$FIELD_LENGTH,
                f.RDB$FIELD_SCALE,
                f.RDB$VALIDATION_SOURCE,
                f.RDB$FIELD_SUB_TYPE,
                f.RDB$FIELD_PRECISION
            FROM RDB$FIELDS f
        `, async (resultSet) => {
            const array: IRDB$FIELD[] = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$FIELD_NAME: resultSet.getString(0),
                    RDB$FIELD_TYPE: resultSet.getNumber(1),
                    RDB$NULL_FLAG: resultSet.getNumber(2) as NullFlag,
                    RDB$DEFAULT_VALUE: resultSet.isNull(3) ? null : await resultSet.getBlob(3).asString(),
                    RDB$FIELD_LENGTH: resultSet.getNumber(4),
                    RDB$FIELD_SCALE: resultSet.getNumber(5),
                    RDB$VALIDATION_SOURCE: resultSet.isNull(6) ? null : await resultSet.getBlob(6).asString(),
                    RDB$FIELD_SUB_TYPE: resultSet.isNull(7) ? null : resultSet.getNumber(7),
                    RDB$FIELD_PRECISION: resultSet.getNumber(8)
                });
            }
            return array;
        });

        const relationFields = await ATransaction.executeQueryResultSet(transaction, `
            SELECT
                TRIM(rf.RDB$RELATION_NAME),
                TRIM(rf.RDB$FIELD_NAME),
                TRIM(rf.RDB$FIELD_SOURCE),
                rf.RDB$NULL_FLAG,
                rf.RDB$DEFAULT_VALUE
            FROM RDB$RELATION_FIELDS rf
            ORDER BY RDB$RELATION_NAME
        `, async (resultSet) => {
            const array: IRDB$RELATIONFIELD[] = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$RELATION_NAME: resultSet.getString(0),
                    RDB$FIELD_NAME: resultSet.getString(1),
                    RDB$FIELD_SOURCE: resultSet.getString(2),
                    RDB$NULL_FLAG: resultSet.getNumber(3) as NullFlag,
                    RDB$DEFAULT_VALUE: resultSet.isNull(4) ? null : await resultSet.getBlob(4).asString()
                });
            }
            return array;
        });

        const constraints = await ATransaction.executeQueryResultSet(transaction, `
            SELECT
                TRIM(rc.RDB$RELATION_NAME),
                TRIM(rc.RDB$CONSTRAINT_NAME),
                TRIM(rc.RDB$CONSTRAINT_TYPE),
                TRIM(s.RDB$INDEX_NAME),
                TRIM(s.RDB$FIELD_NAME),
                TRIM(rfc.RDB$CONST_NAME_UQ),
                TRIM(rfc.RDB$UPDATE_RULE),
                TRIM(rfc.RDB$DELETE_RULE)
            FROM RDB$RELATION_CONSTRAINTS rc
                JOIN RDB$INDEX_SEGMENTS s ON s.RDB$INDEX_NAME = rc.RDB$INDEX_NAME
                LEFT JOIN RDB$REF_CONSTRAINTS rfc ON rfc.RDB$CONSTRAINT_NAME = rc.RDB$CONSTRAINT_NAME
            ORDER BY rc.RDB$RELATION_NAME, rc.RDB$CONSTRAINT_NAME, s.RDB$FIELD_POSITION
        `, async (resultSet) => {
            const array: IRDB$RELATIONCONSTRAINT[] = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$RELATION_NAME: resultSet.getString(0),
                    RDB$CONSTRAINT_NAME: resultSet.getString(1),
                    RDB$CONSTRAINT_TYPE: resultSet.getString(2) as ConstraintType,
                    RDB$INDEX_NAME: resultSet.getString(3),
                    RDB$FIELD_NAME: resultSet.getString(4),
                    RDB$CONST_NAME_UQ: resultSet.getString(5),
                    RDB$UPDATE_RULE: resultSet.getString(6) as UpdateRule,
                    RDB$DELETE_RULE: resultSet.getString(7) as DeleteRule
                });
            }
            return array;
        });

        const dbStructure = new DBStructure();
        dbStructure.load(fields, relationFields, constraints);
        return dbStructure;
    }
}
