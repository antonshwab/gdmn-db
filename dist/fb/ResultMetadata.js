"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AResultMetadata_1 = require("../AResultMetadata");
const fb_utils_1 = require("./utils/fb-utils");
class ResultMetadata extends AResultMetadata_1.AResultMetadata {
    constructor(source) {
        super();
        this._source = source;
    }
    get descriptors() {
        return this._source.fixedDescriptors;
    }
    get columnCount() {
        return this._source.descriptors.length;
    }
    static async getMetadata(statement) {
        const result = await statement.transaction.connection.client
            .statusAction(async (status) => {
            const metadata = await statement.source.handler.getOutputMetadataAsync(status);
            const descriptors = fb_utils_1.createDescriptors(status, metadata);
            const fixedHandler = fb_utils_1.fixMetadata(status, metadata);
            const fixedDescriptors = fb_utils_1.createDescriptors(status, fixedHandler);
            await fixedHandler.releaseAsync();
            return {
                descriptors,
                fixedDescriptors
            };
        });
        return new ResultMetadata(result);
    }
    getColumnLabel(i) {
        return this._source.descriptors[i].alias || "";
    }
    getColumnName(i) {
        return this._source.descriptors[i].field || "";
    }
    getColumnType(i) {
        switch (this._source.descriptors[i].type) {
            case fb_utils_1.SQLTypes.SQL_BLOB:
                return AResultMetadata_1.Types.BLOB;
            case fb_utils_1.SQLTypes.SQL_BOOLEAN:
                return AResultMetadata_1.Types.BOOLEAN;
            case fb_utils_1.SQLTypes.SQL_DOUBLE:
                return AResultMetadata_1.Types.DOUBLE;
            case fb_utils_1.SQLTypes.SQL_FLOAT:
                return AResultMetadata_1.Types.FLOAT;
            case fb_utils_1.SQLTypes.SQL_INT64:
                return AResultMetadata_1.Types.BIGINT;
            case fb_utils_1.SQLTypes.SQL_LONG:
                return AResultMetadata_1.Types.INTEGER;
            case fb_utils_1.SQLTypes.SQL_SHORT:
                return AResultMetadata_1.Types.SMALLINT;
            case fb_utils_1.SQLTypes.SQL_TIMESTAMP:
                return AResultMetadata_1.Types.TIMESTAMP;
            case fb_utils_1.SQLTypes.SQL_TYPE_DATE:
                return AResultMetadata_1.Types.DATE;
            case fb_utils_1.SQLTypes.SQL_TYPE_TIME:
                return AResultMetadata_1.Types.TIME;
            case fb_utils_1.SQLTypes.SQL_NULL:
                return AResultMetadata_1.Types.NULL;
            case fb_utils_1.SQLTypes.SQL_TEXT:
                return AResultMetadata_1.Types.VARCHAR;
            case fb_utils_1.SQLTypes.SQL_VARYING:
                return AResultMetadata_1.Types.CHAR;
            default:
                return AResultMetadata_1.Types.OTHER;
        }
    }
    isNullable(i) {
        return this._source.descriptors[i].isNullable;
    }
}
exports.ResultMetadata = ResultMetadata;
//# sourceMappingURL=ResultMetadata.js.map