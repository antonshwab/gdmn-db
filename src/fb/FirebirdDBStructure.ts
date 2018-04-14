import {ADatabase} from "../ADatabase";
import {ATransaction} from "../ATransaction";
import {DBStructure, IRDB$FIELD, IRDB$RELATIONCONSTRAINT, IRDB$RELATIONFIELD} from "../DBStructure";
import {Factory} from "../Factory";
import {FirebirdOptions} from "./FirebirdDatabase";
import {FirebirdTransaction} from "./FirebirdTransaction";

export class FirebirdDBStructure {

    /**
     * Execute database connection, execute transaction and read the structure of database.
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

        return await ADatabase.executeConnection(Factory.FBDriver.newDatabase(), source,
            async (database) => {
                return await ADatabase.executeTransaction(database, async (transaction) => {
                    return await FirebirdDBStructure.read(transaction);
                });
            });
    }

    private static async read(transaction: ATransaction): Promise<DBStructure> {
        const fields = await ATransaction.executeResultSet(transaction, `
            SELECT
                TRIM(f.RDB$FIELD_NAME),
                f.RDB$FIELD_TYPE,
                f.RDB$NULL_FLAG
            FROM RDB$FIELDS f
        `, async (resultSet) => {
            const array: IRDB$FIELD[] = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$FIELD_NAME: resultSet.getAny(0),
                    RDB$FIELD_TYPE: resultSet.getAny(1),
                    RDB$NULL_FLAG: resultSet.getAny(2)
                });
            }
            return array;
        });

        const relationFields = await ATransaction.executeResultSet(transaction, `
            SELECT
                TRIM(rf.RDB$RELATION_NAME),
                TRIM(rf.RDB$FIELD_NAME),
                TRIM(rf.RDB$FIELD_SOURCE),
                rf.RDB$NULL_FLAG
            FROM RDB$RELATION_FIELDS rf
            ORDER BY RDB$RELATION_NAME
        `, async (resultSet) => {
            const array: IRDB$RELATIONFIELD[] = [];
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

        const constraints = await ATransaction.executeResultSet(transaction, `
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
            const array: IRDB$RELATIONCONSTRAINT[] = [];
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

        const dbStructure = new DBStructure();
        dbStructure.load(fields, relationFields, constraints);
        return dbStructure;
    }
}
