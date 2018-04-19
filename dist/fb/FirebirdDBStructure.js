"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AConnection_1 = require("../AConnection");
const ATransaction_1 = require("../ATransaction");
const DBStructure_1 = require("../DBStructure");
const Factory_1 = require("../Factory");
const FirebirdTransaction_1 = require("./FirebirdTransaction");
class FirebirdDBStructure {
    static async readStructure(source) {
        if (source instanceof FirebirdTransaction_1.FirebirdTransaction) {
            return await FirebirdDBStructure.read(source);
        }
        return await AConnection_1.AConnection.executeConnection(Factory_1.Factory.FBDriver.newConnection(), source, async (connection) => {
            return await AConnection_1.AConnection.executeTransaction(connection, async (transaction) => {
                return await FirebirdDBStructure.read(transaction);
            });
        });
    }
    static async read(transaction) {
        const fields = await ATransaction_1.ATransaction.executeResultSet(transaction, `
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
            const array = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$FIELD_NAME: resultSet.getString(0),
                    RDB$FIELD_TYPE: resultSet.getNumber(1),
                    RDB$NULL_FLAG: resultSet.getNumber(2),
                    RDB$DEFAULT_VALUE: resultSet.isNull(3) ? null : await resultSet.getBlob(3).toString(),
                    RDB$FIELD_LENGTH: resultSet.getNumber(4),
                    RDB$FIELD_SCALE: resultSet.getNumber(5),
                    RDB$VALIDATION_SOURCE: resultSet.isNull(6) ? null : await resultSet.getBlob(6).getString(),
                    RDB$FIELD_SUB_TYPE: resultSet.isNull(7) ? null : resultSet.getNumber(7),
                    RDB$FIELD_PRECISION: resultSet.getNumber(8)
                });
            }
            return array;
        });
        const relationFields = await ATransaction_1.ATransaction.executeResultSet(transaction, `
            SELECT
                TRIM(rf.RDB$RELATION_NAME),
                TRIM(rf.RDB$FIELD_NAME),
                TRIM(rf.RDB$FIELD_SOURCE),
                rf.RDB$NULL_FLAG,
                rf.RDB$DEFAULT_VALUE
            FROM RDB$RELATION_FIELDS rf
            ORDER BY RDB$RELATION_NAME
        `, async (resultSet) => {
            const array = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$RELATION_NAME: resultSet.getString(0),
                    RDB$FIELD_NAME: resultSet.getString(1),
                    RDB$FIELD_SOURCE: resultSet.getString(2),
                    RDB$NULL_FLAG: resultSet.getNumber(3),
                    RDB$DEFAULT_VALUE: resultSet.isNull(4) ? null : await resultSet.getBlob(4).getString()
                });
            }
            return array;
        });
        const constraints = await ATransaction_1.ATransaction.executeResultSet(transaction, `
            SELECT
                TRIM(rc.RDB$RELATION_NAME),
                TRIM(rc.RDB$CONSTRAINT_NAME),
                rc.RDB$CONSTRAINT_TYPE,
                TRIM(s.RDB$INDEX_NAME),
                TRIM(s.RDB$FIELD_NAME),
                TRIM(rfc.RDB$CONST_NAME_UQ),
                rfc.RDB$UPDATE_RULE,
                rfc.RDB$DELETE_RULE
            FROM RDB$RELATION_CONSTRAINTS rc
                JOIN RDB$INDEX_SEGMENTS s ON s.RDB$INDEX_NAME = rc.RDB$INDEX_NAME
                LEFT JOIN RDB$REF_CONSTRAINTS rfc ON rfc.RDB$CONSTRAINT_NAME = rc.RDB$CONSTRAINT_NAME
            ORDER BY rc.RDB$RELATION_NAME, rc.RDB$CONSTRAINT_NAME, s.RDB$FIELD_POSITION
        `, async (resultSet) => {
            const array = [];
            while (await resultSet.next()) {
                array.push({
                    RDB$RELATION_NAME: resultSet.getString(0),
                    RDB$CONSTRAINT_NAME: resultSet.getString(1),
                    RDB$CONSTRAINT_TYPE: await resultSet.getBlob(2).getString(),
                    RDB$INDEX_NAME: resultSet.getString(3),
                    RDB$FIELD_NAME: resultSet.getString(4),
                    RDB$CONST_NAME_UQ: resultSet.getString(5),
                    RDB$UPDATE_RULE: await resultSet.getBlob(6).getString(),
                    RDB$DELETE_RULE: await resultSet.getBlob(7).getString()
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