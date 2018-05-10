"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AResultSetMetadata_1 = require("../AResultSetMetadata");
const fb_utils_1 = require("./utils/fb-utils");
class ResultSetMetadata extends AResultSetMetadata_1.AResultSetMetadata {
    constructor(source) {
        super();
        this._source = source;
    }
    get descriptors() {
        return this._source.fixedDescriptors;
    }
    get columnCount() {
        this._checkClosed();
        return this._source.descriptors.length;
    }
    get handler() {
        this._checkClosed();
        return this._source.fixedHandler;
    }
    static async getMetadata(statement) {
        const result = await statement.transaction.connection.context
            .statusAction(async (status) => {
            const metadata = await statement.source.handler.getOutputMetadataAsync(status);
            const descriptors = fb_utils_1.createDescriptors(status, metadata);
            const fixedHandler = fb_utils_1.fixMetadata(status, metadata);
            const fixedDescriptors = fb_utils_1.createDescriptors(status, fb_utils_1.fixMetadata(status, metadata));
            return {
                fixedHandler,
                descriptors,
                fixedDescriptors
            };
        });
        return new ResultSetMetadata(result);
    }
    getColumnLabel(i) {
        this._checkClosed();
        return this._source.descriptors[i].alias || "";
    }
    getColumnName(i) {
        this._checkClosed();
        return this._source.descriptors[i].field || "";
    }
    getColumnType(i) {
        this._checkClosed();
        switch (this._source.descriptors[i].type) {
            case fb_utils_1.SQLTypes.SQL_BLOB:
                return AResultSetMetadata_1.Types.BLOB;
            case fb_utils_1.SQLTypes.SQL_BOOLEAN:
                return AResultSetMetadata_1.Types.BOOLEAN;
            case fb_utils_1.SQLTypes.SQL_DOUBLE:
                return AResultSetMetadata_1.Types.DOUBLE;
            case fb_utils_1.SQLTypes.SQL_FLOAT:
                return AResultSetMetadata_1.Types.FLOAT;
            case fb_utils_1.SQLTypes.SQL_INT64:
                return AResultSetMetadata_1.Types.BIGINT;
            case fb_utils_1.SQLTypes.SQL_LONG:
                return AResultSetMetadata_1.Types.INTEGER;
            case fb_utils_1.SQLTypes.SQL_SHORT:
                return AResultSetMetadata_1.Types.SMALLINT;
            case fb_utils_1.SQLTypes.SQL_TIMESTAMP:
                return AResultSetMetadata_1.Types.TIMESTAMP;
            case fb_utils_1.SQLTypes.SQL_TYPE_DATE:
                return AResultSetMetadata_1.Types.DATE;
            case fb_utils_1.SQLTypes.SQL_TYPE_TIME:
                return AResultSetMetadata_1.Types.TIME;
            case fb_utils_1.SQLTypes.SQL_NULL:
                return AResultSetMetadata_1.Types.NULL;
            case fb_utils_1.SQLTypes.SQL_TEXT:
                return AResultSetMetadata_1.Types.VARCHAR;
            case fb_utils_1.SQLTypes.SQL_VARYING:
                return AResultSetMetadata_1.Types.CHAR;
            default:
                return AResultSetMetadata_1.Types.OTHER;
        }
    }
    isNullable(i) {
        this._checkClosed();
        return this._source.descriptors[i].isNullable;
    }
    async release() {
        await this._source.fixedHandler.releaseAsync();
        this._source = undefined;
    }
    _checkClosed() {
        if (!this._source) {
            throw new Error("ResultSet is closed");
        }
    }
}
exports.ResultSetMetadata = ResultSetMetadata;
//# sourceMappingURL=ResultSetMetadata.js.map