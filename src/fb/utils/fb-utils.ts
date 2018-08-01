import {MessageMetadata, Status, Util, XpbBuilder} from "node-firebird-native-api";
import {endianness} from "os";
import {StringDecoder} from "string_decoder";
import {IConnectionOptions} from "../../AConnection";
import {Statement} from "../Statement";
import {BlobLink} from "./BlobLink";
import {BlobStream} from "./BlobStream";
import {isc_dpb, XpbBuilderParams} from "./constants";
import {decodeDate, decodeTime, encodeDate, encodeTime} from "./date-time";

const littleEndian = endianness() === "LE";

export enum SQLTypes {
    SQL_TEXT = 452,
    SQL_VARYING = 448,
    SQL_SHORT = 500,
    SQL_LONG = 496,
    SQL_FLOAT = 482,
    SQL_DOUBLE = 480,
    // SQL_D_FLOAT = 530,
    SQL_TIMESTAMP = 510,
    SQL_BLOB = 520,
    // SQL_ARRAY = 540,
    // SQL_QUAD = 550,
    SQL_TYPE_TIME = 560,
    SQL_TYPE_DATE = 570,
    SQL_INT64 = 580,
    SQL_BOOLEAN = 32764,
    SQL_NULL = 32766
}

export enum SQL_BLOB_SUB_TYPE {
    BINARY = 0,
    TEXT = 1,
    BLR = 2
}

export enum dpb {
    isc_dpb_version1 = 1,
    isc_dpb_set_db_sql_dialect = 65,
    lc_ctype = 48,
    user_name = 28,
    password = 29
}

export enum tpb {
    isc_tpb_version1 = 1,
    isc_tpb_consistency = 1,
    isc_tpb_concurrency = 2,
    isc_tpb_wait = 6,
    isc_tpb_nowait = 7,
    isc_tpb_read = 8,
    isc_tpb_write = 9,
    isc_tpb_ignore_limbo = 14,
    isc_tpb_read_committed = 15,
    isc_tpb_autocommit = 16,
    isc_tpb_rec_version = 17,
    isc_tpb_no_rec_version = 18,
    isc_tpb_restart_requests = 19,
    isc_tpb_no_auto_undo = 20
}

export enum blobInfo {
    totalLength = 6
}

export function iscVaxInteger2(buffer: Buffer, startPos: number): number {
    /* tslint:disable */
    return (buffer[startPos] & 0xff) | ((buffer[startPos + 1] & 0xff) << 8);
    /* tslint:enable */
}

export function createDpb(dbOptions: IConnectionOptions, util: Util, status: Status): XpbBuilder {
    const dbParamBuffer = (util.getXpbBuilderSync(status, XpbBuilderParams.DPB, undefined, 0))!;
    dbParamBuffer.insertIntSync(status, isc_dpb.page_size, 4 * 1024);
    dbParamBuffer.insertStringSync(status, isc_dpb.user_name, dbOptions.username || "sysdba");
    dbParamBuffer.insertStringSync(status, isc_dpb.password, dbOptions.password || "masterkey");
    return dbParamBuffer;
}

export enum TransactionIsolation {
    CONSISTENCY = "CONSISTENCY",
    READ_COMMITTED = "READ_COMMITTED",
    SNAPSHOT = "SNAPSHOT"
}

/** ITransactionOpt interface. */
export interface ITransactionOpt {
    isolation?: TransactionIsolation;
    readCommittedMode?: "NO_RECORD_VERSION" | "RECORD_VERSION";
    accessMode?: "READ_ONLY" | "READ_WRITE";
    waitMode?: "NO_WAIT" | "WAIT";
    noAutoUndo?: boolean;
    ignoreLimbo?: boolean;
    restartRequests?: boolean;
    autoCommit?: boolean;
    //// TODO: lockTimeOut?: number;
}

export function createTpb(options: ITransactionOpt, util: Util, status: Status): XpbBuilder {
    const tnxParamBuffer = (util.getXpbBuilderSync(status, XpbBuilderParams.TPB, undefined, 0))!;

    switch (options.accessMode) {
        case "READ_ONLY":
            tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_read);
            break;

        case "READ_WRITE":
            tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_write);
            break;
    }

    switch (options.waitMode) {
        case "NO_WAIT":
            tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_nowait);
            break;

        case "WAIT":
            tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_wait);
            break;
    }

    switch (options.isolation) {
        case TransactionIsolation.CONSISTENCY:
            tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_consistency);
            break;

        case TransactionIsolation.SNAPSHOT:
            tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_concurrency);
            break;

        case TransactionIsolation.READ_COMMITTED:
            tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_read_committed);
            if (options.readCommittedMode === "RECORD_VERSION") {
                tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_rec_version);
            } else {
                tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_no_rec_version);
            }
            break;
    }

    if (options.noAutoUndo) {
        tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_no_auto_undo);
    }

    if (options.ignoreLimbo) {
        tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_ignore_limbo);

    }

    if (options.restartRequests) {
        tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_restart_requests);
    }

    if (options.autoCommit) {
        tnxParamBuffer.insertTagSync(status, tpb.isc_tpb_autocommit);
    }

    return tnxParamBuffer;
}

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
export function getPortableInteger(buffer: Uint8Array, length: number): number {
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

/** Descriptor for a field or parameter. */
export interface IDescriptor {
    alias?: string;
    field?: string;
    type: number;
    subType: number;
    length: number;
    scale: number;
    offset: number;
    nullOffset: number;
    isNullable: boolean;
}

export function createDescriptors(status: Status, metadata?: MessageMetadata): IDescriptor[] {
    if (!metadata) {
        return [];
    }

    const count = metadata.getCountSync(status);
    const ret: IDescriptor[] = [];

    for (let i = 0; i < count; ++i) {
        ret.push({
            alias: metadata.getAliasSync(status, i),
            field: metadata.getFieldSync(status, i),
            type: metadata.getTypeSync(status, i),
            subType: metadata.getSubTypeSync(status, i),
            length: metadata.getLengthSync(status, i),
            scale: metadata.getScaleSync(status, i),
            offset: metadata.getOffsetSync(status, i),
            nullOffset: metadata.getNullOffsetSync(status, i),
            isNullable: metadata.isNullableSync(status, i)
        });
    }

    return ret;
}

export function bufferToValue(statement: Statement,
                              outDescriptor: IDescriptor,
                              outBuffer: Uint8Array): any {
    const dataView = new DataView(outBuffer.buffer);

    if (dataView.getInt16(outDescriptor.nullOffset, littleEndian) === -1) {
        return null;
    }

    switch (outDescriptor.type) {
        // SQL_TEXT is handled changing its descriptor to SQL_VARYING with IMetadataBuilder.
        case SQLTypes.SQL_VARYING: {
            //// TODO: none, octets
            const varLength = dataView.getUint16(outDescriptor.offset, littleEndian);
            const decoder = new StringDecoder("utf8");
            const buf = Buffer.from(outBuffer.buffer as any, outDescriptor.offset + 2, varLength);
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
            const decodedTime = decodeTime(dataView.getUint32(outDescriptor.offset, littleEndian));
            return new Date(now.getFullYear(), now.getMonth(), now.getDate(),
                decodedTime.hours, decodedTime.minutes, decodedTime.seconds, decodedTime.fractions / 10);
        }

        case SQLTypes.SQL_TYPE_DATE: {
            const decodedDate = decodeDate(dataView.getInt32(outDescriptor.offset, littleEndian));
            return new Date(decodedDate.year, decodedDate.month - 1, decodedDate.day);
        }

        case SQLTypes.SQL_TIMESTAMP: {
            const decodedDate = decodeDate(dataView.getInt32(outDescriptor.offset, littleEndian));
            const decodedTime = decodeTime(dataView.getUint32(outDescriptor.offset + 4, littleEndian));
            return new Date(decodedDate.year, decodedDate.month - 1, decodedDate.day,
                decodedTime.hours, decodedTime.minutes, decodedTime.seconds, decodedTime.fractions / 10);
        }

        case SQLTypes.SQL_BOOLEAN:
            return dataView.getInt8(outDescriptor.offset) !== 0;

        case SQLTypes.SQL_BLOB:
            return new BlobLink(statement.transaction.connection,
                outBuffer.slice(outDescriptor.offset, outDescriptor.offset + 8));

        case SQLTypes.SQL_NULL:
            return null;

        default:
            throw new Error(`Unrecognized Firebird type number ${outDescriptor.type}`);
    }
}

export async function valueToBuffer(statement: Statement,
                                    inDescriptor: IDescriptor,
                                    inBuffer: Uint8Array,
                                    value: any): Promise<void> {
    const dataView = new DataView(inBuffer.buffer);

    if (value == null) {
        dataView.setInt16(inDescriptor.nullOffset, -1, littleEndian);
        return;
    }

    switch (inDescriptor.type) {
        // SQL_TEXT is handled changing its descriptor to SQL_VARYING with IMetadataBuilder.
        case SQLTypes.SQL_VARYING: {
            //// TODO: none, octets
            const str = value as string;
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
            const date = value as Date;
            dataView.setUint32(inDescriptor.offset,
                encodeTime(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds() * 10),
                littleEndian);
            break;
        }

        case SQLTypes.SQL_TYPE_DATE: {
            const date = value as Date;
            dataView.setInt32(inDescriptor.offset,
                encodeDate(date.getFullYear(), date.getMonth() + 1, date.getDate()),
                littleEndian);
            break;
        }

        case SQLTypes.SQL_TIMESTAMP: {
            const date = value as Date;
            dataView.setInt32(inDescriptor.offset,
                encodeDate(date.getFullYear(), date.getMonth() + 1, date.getDate()),
                littleEndian);
            dataView.setUint32(inDescriptor.offset + 4,
                encodeTime(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds() * 10),
                littleEndian);
            break;
        }

        case SQLTypes.SQL_BOOLEAN:
            dataView.setInt8(inDescriptor.offset, value ? 1 : 0);
            break;

        case SQLTypes.SQL_BLOB: {
            const targetBlobId = inBuffer.subarray(inDescriptor.offset, inDescriptor.offset + 8);

            if (value instanceof BlobStream) {
                value = value.blobLink;
            }

            if (inDescriptor.subType === SQL_BLOB_SUB_TYPE.TEXT && typeof value === "string") {
                value = Buffer.from(value, "utf8");
            }

            if (value instanceof Buffer) {
                const blobStream = await BlobStream.create(statement.transaction);
                try {
                    await blobStream.write(value);
                } catch (e) {
                    await blobStream.cancel();
                    throw e;
                }

                await blobStream.close();

                targetBlobId.set(blobStream.blobLink.id);

            } else if (value instanceof BlobLink) {
                if (value.connection === statement.transaction.connection) {
                    targetBlobId.set(value.id);
                } else {
                    throw new Error("Cannot pass a BLOB from another handler as parameter.");
                    //// TODO: add support for it
                }
            } else {
                throw new Error("Unrecognized type used as BLOB. Must be: Buffer or BlobLink.");
            }
            break;
        }

        case SQLTypes.SQL_NULL:
            break;

        default:
            throw new Error(`Unrecognized Firebird type number ${inDescriptor.type}`);
    }
}

export async function dataRead(statement: Statement,
                               outDescriptors: IDescriptor[],
                               outBuffer: Uint8Array): Promise<any[]> {
    return await Promise.all(outDescriptors.map((descriptor) => (
        bufferToValue(statement, descriptor, outBuffer))
    ));
}

export async function dataWrite(statement: Statement,
                                inDescriptors: IDescriptor[],
                                inBuffer: Uint8Array,
                                values: any[]): Promise<void> {
    if (values.length !== inDescriptors.length) {
        throw new Error("Incorrect number of parameters: expected " + inDescriptors.length +
            `, received ${(values || []).length}.`);
    }

    await Promise.all(inDescriptors.map((descriptor, index) => (
        valueToBuffer(statement, descriptor, inBuffer, values[index]))
    ));
}

export function fixMetadata(status: Status, metadata?: MessageMetadata): MessageMetadata | undefined {
    if (!metadata) {
        return undefined;
    }

    let ret: MessageMetadata;

    const outBuilder = metadata.getBuilderSync(status)!;
    try {
        for (let i = metadata.getCountSync(status) - 1; i >= 0; --i) {
            switch (metadata.getTypeSync(status, i) as SQLTypes) {
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

        ret = outBuilder.getMetadataSync(status)!;
    }
    finally {
        outBuilder.releaseSync();
    }

    metadata.releaseSync();

    return ret;
}
