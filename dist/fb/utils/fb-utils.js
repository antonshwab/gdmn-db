"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const string_decoder_1 = require("string_decoder");
const FirebirdBlobLink_1 = require("../FirebirdBlobLink");
const FirebirdBlobStream_1 = require("../FirebirdBlobStream");
const date_time_1 = require("./date-time");
const littleEndian = os_1.endianness() === "LE";
var SQLTypes;
(function (SQLTypes) {
    SQLTypes[SQLTypes["SQL_TEXT"] = 452] = "SQL_TEXT";
    SQLTypes[SQLTypes["SQL_VARYING"] = 448] = "SQL_VARYING";
    SQLTypes[SQLTypes["SQL_SHORT"] = 500] = "SQL_SHORT";
    SQLTypes[SQLTypes["SQL_LONG"] = 496] = "SQL_LONG";
    SQLTypes[SQLTypes["SQL_FLOAT"] = 482] = "SQL_FLOAT";
    SQLTypes[SQLTypes["SQL_DOUBLE"] = 480] = "SQL_DOUBLE";
    // SQL_D_FLOAT = 530,
    SQLTypes[SQLTypes["SQL_TIMESTAMP"] = 510] = "SQL_TIMESTAMP";
    SQLTypes[SQLTypes["SQL_BLOB"] = 520] = "SQL_BLOB";
    // SQL_ARRAY = 540,
    // SQL_QUAD = 550,
    SQLTypes[SQLTypes["SQL_TYPE_TIME"] = 560] = "SQL_TYPE_TIME";
    SQLTypes[SQLTypes["SQL_TYPE_DATE"] = 570] = "SQL_TYPE_DATE";
    SQLTypes[SQLTypes["SQL_INT64"] = 580] = "SQL_INT64";
    SQLTypes[SQLTypes["SQL_BOOLEAN"] = 32764] = "SQL_BOOLEAN";
    SQLTypes[SQLTypes["SQL_NULL"] = 32766] = "SQL_NULL";
})(SQLTypes = exports.SQLTypes || (exports.SQLTypes = {}));
var SQL_BLOB_SUB_TYPE;
(function (SQL_BLOB_SUB_TYPE) {
    SQL_BLOB_SUB_TYPE[SQL_BLOB_SUB_TYPE["BINARY"] = 0] = "BINARY";
    SQL_BLOB_SUB_TYPE[SQL_BLOB_SUB_TYPE["TEXT"] = 1] = "TEXT";
    SQL_BLOB_SUB_TYPE[SQL_BLOB_SUB_TYPE["BLR"] = 2] = "BLR";
})(SQL_BLOB_SUB_TYPE = exports.SQL_BLOB_SUB_TYPE || (exports.SQL_BLOB_SUB_TYPE = {}));
var dpb;
(function (dpb) {
    dpb[dpb["isc_dpb_version1"] = 1] = "isc_dpb_version1";
    dpb[dpb["isc_dpb_set_db_sql_dialect"] = 65] = "isc_dpb_set_db_sql_dialect";
    dpb[dpb["lc_ctype"] = 48] = "lc_ctype";
    dpb[dpb["user_name"] = 28] = "user_name";
    dpb[dpb["password"] = 29] = "password";
})(dpb = exports.dpb || (exports.dpb = {}));
var tpb;
(function (tpb) {
    tpb[tpb["isc_tpb_version1"] = 1] = "isc_tpb_version1";
    tpb[tpb["isc_tpb_consistency"] = 1] = "isc_tpb_consistency";
    tpb[tpb["isc_tpb_concurrency"] = 2] = "isc_tpb_concurrency";
    tpb[tpb["isc_tpb_wait"] = 6] = "isc_tpb_wait";
    tpb[tpb["isc_tpb_nowait"] = 7] = "isc_tpb_nowait";
    tpb[tpb["isc_tpb_read"] = 8] = "isc_tpb_read";
    tpb[tpb["isc_tpb_write"] = 9] = "isc_tpb_write";
    tpb[tpb["isc_tpb_ignore_limbo"] = 14] = "isc_tpb_ignore_limbo";
    tpb[tpb["isc_tpb_read_committed"] = 15] = "isc_tpb_read_committed";
    tpb[tpb["isc_tpb_autocommit"] = 16] = "isc_tpb_autocommit";
    tpb[tpb["isc_tpb_rec_version"] = 17] = "isc_tpb_rec_version";
    tpb[tpb["isc_tpb_no_rec_version"] = 18] = "isc_tpb_no_rec_version";
    tpb[tpb["isc_tpb_restart_requests"] = 19] = "isc_tpb_restart_requests";
    tpb[tpb["isc_tpb_no_auto_undo"] = 20] = "isc_tpb_no_auto_undo";
})(tpb = exports.tpb || (exports.tpb = {}));
var blobInfo;
(function (blobInfo) {
    blobInfo[blobInfo["totalLength"] = 6] = "totalLength";
})(blobInfo = exports.blobInfo || (exports.blobInfo = {}));
function createDpb(options) {
    const code = (c) => String.fromCharCode(c);
    let ret = `${code(dpb.isc_dpb_version1)}`;
    const dialect = 3;
    ret += `${code(dpb.isc_dpb_set_db_sql_dialect)}${code(dialect.toString().length)}${code(dialect)}`;
    const charSet = "utf8";
    ret += `${code(dpb.lc_ctype)}${code(charSet.length)}${charSet}`;
    if (!options) {
        options = {};
    }
    if (!options.username) {
        options.username = process.env.ISC_USER;
    }
    if (!options.password) {
        options.password = process.env.ISC_PASSWORD;
    }
    if (options.username) {
        ret += `${code(dpb.user_name)}${code(options.username.length)}${options.username}`;
    }
    if (options.password) {
        ret += `${code(dpb.password)}${code(options.password.length)}${options.password}`;
    }
    return Buffer.from(ret);
}
exports.createDpb = createDpb;
var TransactionIsolation;
(function (TransactionIsolation) {
    TransactionIsolation["CONSISTENCY"] = "CONSISTENCY";
    TransactionIsolation["READ_COMMITTED"] = "READ_COMMITTED";
    TransactionIsolation["SNAPSHOT"] = "SNAPSHOT";
})(TransactionIsolation = exports.TransactionIsolation || (exports.TransactionIsolation = {}));
function createTpb(options) {
    const code = (c) => String.fromCharCode(c);
    let ret = code(tpb.isc_tpb_version1);
    if (!options) {
        options = {};
    }
    switch (options.accessMode) {
        case "READ_ONLY":
            ret += code(tpb.isc_tpb_read);
            break;
        case "READ_WRITE":
            ret += code(tpb.isc_tpb_write);
            break;
    }
    switch (options.waitMode) {
        case "NO_WAIT":
            ret += code(tpb.isc_tpb_nowait);
            break;
        case "WAIT":
            ret += code(tpb.isc_tpb_wait);
            break;
    }
    switch (options.isolation) {
        case TransactionIsolation.CONSISTENCY:
            ret += code(tpb.isc_tpb_consistency);
            break;
        case TransactionIsolation.SNAPSHOT:
            ret += code(tpb.isc_tpb_concurrency);
            break;
        case TransactionIsolation.READ_COMMITTED:
            ret += code(tpb.isc_tpb_read_committed) +
                code(options.readCommittedMode === "RECORD_VERSION"
                    ? tpb.isc_tpb_rec_version
                    : tpb.isc_tpb_no_rec_version);
            break;
    }
    if (options.noAutoUndo) {
        ret += code(tpb.isc_tpb_no_auto_undo);
    }
    if (options.ignoreLimbo) {
        ret += code(tpb.isc_tpb_ignore_limbo);
    }
    if (options.restartRequests) {
        ret += code(tpb.isc_tpb_restart_requests);
    }
    if (options.autoCommit) {
        ret += code(tpb.isc_tpb_autocommit);
    }
    return Buffer.from(ret);
}
exports.createTpb = createTpb;
/** Changes a number from a scale to another. */
/***
 export function changeScale(value: number, inputScale: number, outputScale: number): number {
    outputScale -= inputScale;
    Math.pow(10, outputScale);
    if (outputScale === 0)
        return value;
    else if (outputScale > 0)
        return value / Math.pow(10, outputScale);
    else	// outputScale < 0
        return value * Math.pow(10, -outputScale);
}
 ***/
/** Emulate Firebird isc_portable_integer. */
function getPortableInteger(buffer, length) {
    if (!buffer || length <= 0 || length > 8) {
        return 0;
    }
    let value = 0;
    let pos = 0;
    for (let shift = 0; --length >= 0; shift += 8) {
        /* tslint:disable */
        value += buffer[pos++] << shift;
        /* tslint:enable */
    }
    return value;
}
exports.getPortableInteger = getPortableInteger;
function createDescriptors(status, metadata) {
    if (!metadata) {
        return [];
    }
    const count = metadata.getCountSync(status);
    const ret = [];
    for (let i = 0; i < count; ++i) {
        ret.push({
            alias: metadata.getAliasSync(status, i),
            type: metadata.getTypeSync(status, i),
            subType: metadata.getSubTypeSync(status, i),
            nullOffset: metadata.getNullOffsetSync(status, i),
            offset: metadata.getOffsetSync(status, i),
            length: metadata.getLengthSync(status, i),
            scale: metadata.getScaleSync(status, i),
        });
    }
    return ret;
}
exports.createDescriptors = createDescriptors;
function bufferToValue(statement, outDescriptor, outBuffer) {
    const dataView = new DataView(outBuffer.buffer);
    if (dataView.getInt16(outDescriptor.nullOffset, littleEndian) === -1) {
        return null;
    }
    switch (outDescriptor.type) {
        // SQL_TEXT is handled changing its descriptor to SQL_VARYING with IMetadataBuilder.
        case SQLTypes.SQL_VARYING: {
            //// TODO: none, octets
            const varLength = dataView.getUint16(outDescriptor.offset, littleEndian);
            const decoder = new string_decoder_1.StringDecoder("utf8");
            const buf = Buffer.from(outBuffer.buffer, outDescriptor.offset + 2, varLength);
            return decoder.end(buf);
        }
        /***
         case sqlTypes.SQL_SHORT:
         return changeScale(dataView.getInt16(descriptor.offset, littleEndian), descriptor.scale, 0);
         case sqlTypes.SQL_LONG:
         return changeScale(dataView.getInt32(descriptor.offset, littleEndian), descriptor.scale, 0);
         //// TODO: sqlTypes.SQL_INT64
         case sqlTypes.SQL_FLOAT:
         return dataView.getFloat32(descriptor.offset, littleEndian);
         ***/
        case SQLTypes.SQL_DOUBLE:
            return dataView.getFloat64(outDescriptor.offset, littleEndian);
        case SQLTypes.SQL_TYPE_TIME: {
            const now = new Date();
            const decodedTime = date_time_1.decodeTime(dataView.getUint32(outDescriptor.offset, littleEndian));
            return new Date(now.getFullYear(), now.getMonth(), now.getDate(), decodedTime.hours, decodedTime.minutes, decodedTime.seconds, decodedTime.fractions / 10);
        }
        case SQLTypes.SQL_TYPE_DATE: {
            const decodedDate = date_time_1.decodeDate(dataView.getInt32(outDescriptor.offset, littleEndian));
            return new Date(decodedDate.year, decodedDate.month - 1, decodedDate.day);
        }
        case SQLTypes.SQL_TIMESTAMP: {
            const decodedDate = date_time_1.decodeDate(dataView.getInt32(outDescriptor.offset, littleEndian));
            const decodedTime = date_time_1.decodeTime(dataView.getUint32(outDescriptor.offset + 4, littleEndian));
            return new Date(decodedDate.year, decodedDate.month - 1, decodedDate.day, decodedTime.hours, decodedTime.minutes, decodedTime.seconds, decodedTime.fractions / 10);
        }
        case SQLTypes.SQL_BOOLEAN:
            return dataView.getInt8(outDescriptor.offset) !== 0;
        case SQLTypes.SQL_BLOB:
            return new FirebirdBlobLink_1.FirebirdBlobLink(statement.parent.parent, outBuffer.slice(outDescriptor.offset, outDescriptor.offset + 8));
        case SQLTypes.SQL_NULL:
            return null;
        default:
            throw new Error(`Unrecognized Firebird type number ${outDescriptor.type}`);
    }
}
exports.bufferToValue = bufferToValue;
async function valueToBuffer(statement, inDescriptor, inBuffer, value) {
    const dataView = new DataView(inBuffer.buffer);
    if (value == null) {
        dataView.setInt16(inDescriptor.nullOffset, -1, littleEndian);
        return;
    }
    switch (inDescriptor.type) {
        // SQL_TEXT is handled changing its descriptor to SQL_VARYING with IMetadataBuilder.
        case SQLTypes.SQL_VARYING: {
            //// TODO: none, octets
            const str = value;
            const strBuffer = Buffer.from(str);
            const bytesArray = Uint8Array.from(strBuffer);
            if (bytesArray.length > inDescriptor.length) {
                throw new Error(`Length in bytes of string '${str}' (${bytesArray.length}) is ` +
                    `greater than maximum expect length ${inDescriptor.length}.`);
            }
            dataView.setUint16(inDescriptor.offset, bytesArray.length, littleEndian);
            for (let y = 0; y < bytesArray.length; ++y) {
                inBuffer[inDescriptor.offset + 2 + y] = bytesArray[y];
            }
            break;
        }
        /***
         case sqlTypes.SQL_SHORT:
         dataView.setInt16(descriptor.offset, changeScale(value, 0, descriptor.scale), littleEndian);
         break;
         case sqlTypes.SQL_LONG:
         dataView.setInt32(descriptor.offset, changeScale(value, 0, descriptor.scale), littleEndian);
         break;
         //// TODO: sqlTypes.SQL_INT64
         case sqlTypes.SQL_FLOAT:
         dataView.setFloat32(descriptor.offset, value, littleEndian);
         break;
         ***/
        case SQLTypes.SQL_DOUBLE:
            dataView.setFloat64(inDescriptor.offset, value, littleEndian);
            break;
        case SQLTypes.SQL_TYPE_TIME: {
            const date = value;
            dataView.setUint32(inDescriptor.offset, date_time_1.encodeTime(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds() * 10), littleEndian);
            break;
        }
        case SQLTypes.SQL_TYPE_DATE: {
            const date = value;
            dataView.setInt32(inDescriptor.offset, date_time_1.encodeDate(date.getFullYear(), date.getMonth() + 1, date.getDate()), littleEndian);
            break;
        }
        case SQLTypes.SQL_TIMESTAMP: {
            const date = value;
            dataView.setInt32(inDescriptor.offset, date_time_1.encodeDate(date.getFullYear(), date.getMonth() + 1, date.getDate()), littleEndian);
            dataView.setUint32(inDescriptor.offset + 4, date_time_1.encodeTime(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds() * 10), littleEndian);
            break;
        }
        case SQLTypes.SQL_BOOLEAN:
            dataView.setInt8(inDescriptor.offset, value ? 1 : 0);
            break;
        case SQLTypes.SQL_BLOB: {
            const targetBlobId = inBuffer.subarray(inDescriptor.offset, inDescriptor.offset + 8);
            if (value instanceof FirebirdBlobStream_1.FirebirdBlobStream) {
                value = value.blobLink;
            }
            if (inDescriptor.subType === SQL_BLOB_SUB_TYPE.TEXT && typeof value === "string") {
                value = Buffer.from(value, "utf8");
            }
            if (value instanceof Buffer) {
                const blobStream = await FirebirdBlobStream_1.FirebirdBlobStream.create(statement.parent);
                try {
                    await blobStream.write(value);
                }
                catch (e) {
                    await blobStream.cancel();
                    throw e;
                }
                await blobStream.close();
                targetBlobId.set(blobStream.blobLink.id);
            }
            else if (value instanceof FirebirdBlobLink_1.FirebirdBlobLink) {
                if (value.connection === statement.parent.parent) {
                    targetBlobId.set(value.id);
                }
                else {
                    throw new Error("Cannot pass a BLOB from another handler as parameter.");
                    //// TODO: add support for it
                }
            }
            else {
                throw new Error("Unrecognized type used as BLOB. Must be: Buffer or FirebirdBlobLink.");
            }
            break;
        }
        case SQLTypes.SQL_NULL:
            break;
        default:
            throw new Error(`Unrecognized Firebird type number ${inDescriptor.type}`);
    }
}
exports.valueToBuffer = valueToBuffer;
async function dataWrite(statement, inDescriptors, inBuffer, values) {
    if (values.length !== inDescriptors.length) {
        throw new Error("Incorrect number of parameters: expected " + inDescriptors.length +
            `, received ${(values || []).length}.`);
    }
    await Promise.all(inDescriptors.map((descriptor, index) => (valueToBuffer(statement, descriptor, inBuffer, values[index]))));
}
exports.dataWrite = dataWrite;
function fixMetadata(status, metadata) {
    if (!metadata) {
        return undefined;
    }
    let ret;
    const outBuilder = metadata.getBuilderSync(status);
    try {
        for (let i = metadata.getCountSync(status) - 1; i >= 0; --i) {
            switch (metadata.getTypeSync(status, i)) {
                // Transforms CHAR descriptors to VARCHAR.
                case SQLTypes.SQL_TEXT:
                    outBuilder.setTypeSync(status, i, SQLTypes.SQL_VARYING);
                    break;
                // Transforms numeric descriptors to DOUBLE PRECISION.
                case SQLTypes.SQL_SHORT:
                case SQLTypes.SQL_LONG:
                case SQLTypes.SQL_INT64:
                case SQLTypes.SQL_FLOAT:
                    outBuilder.setTypeSync(status, i, SQLTypes.SQL_DOUBLE);
                    outBuilder.setLengthSync(status, i, 8);
                    outBuilder.setScaleSync(status, i, 0);
                    break;
            }
        }
        ret = outBuilder.getMetadataSync(status);
    }
    finally {
        outBuilder.releaseSync();
    }
    metadata.releaseSync();
    return ret;
}
exports.fixMetadata = fixMetadata;
//# sourceMappingURL=fb-utils.js.map