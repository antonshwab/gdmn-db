/// <reference types="node" />
import * as fb from "node-firebird-native-api";
import { FirebirdStatement } from "../FirebirdStatement";
export declare enum SQLTypes {
    SQL_TEXT = 452,
    SQL_VARYING = 448,
    SQL_SHORT = 500,
    SQL_LONG = 496,
    SQL_FLOAT = 482,
    SQL_DOUBLE = 480,
    SQL_TIMESTAMP = 510,
    SQL_BLOB = 520,
    SQL_TYPE_TIME = 560,
    SQL_TYPE_DATE = 570,
    SQL_INT64 = 580,
    SQL_BOOLEAN = 32764,
    SQL_NULL = 32766,
}
export declare enum dpb {
    isc_dpb_version1 = 1,
    lc_ctype = 48,
    user_name = 28,
    password = 29,
}
export declare enum tpb {
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
    isc_tpb_no_auto_undo = 20,
}
export declare enum blobInfo {
    totalLength = 6,
}
export declare function createDpb(options?: {
    username?: string;
    password?: string;
}): Buffer;
export declare enum TransactionIsolation {
    CONSISTENCY = "CONSISTENCY",
    READ_COMMITTED = "READ_COMMITTED",
    SNAPSHOT = "SNAPSHOT",
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
}
export declare function createTpb(options?: ITransactionOpt): Buffer;
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
export declare function getPortableInteger(buffer: Uint8Array, length: number): number;
/** Descriptor for a field or parameter. */
export interface IDescriptor {
    type: number;
    subType: number;
    length: number;
    scale: number;
    offset: number;
    nullOffset: number;
}
export declare type DataReader = (statement: FirebirdStatement, buffer: Uint8Array) => Promise<any[]>;
export declare type ItemReader = (statement: FirebirdStatement, buffer: Uint8Array) => Promise<any>;
/** Creates a data reader. */
export declare function createDataReader(descriptors: IDescriptor[]): DataReader;
export declare type DataWriter = (statement: FirebirdStatement, buffer: Uint8Array, values: any[] | undefined) => Promise<void>;
export declare type ItemWriter = (statement: FirebirdStatement, buffer: Uint8Array, values: any) => Promise<void>;
/** Creates a data writer. */
export declare function createDataWriter(descriptors: IDescriptor[]): DataWriter;
export declare function fixMetadata(status: fb.Status, metadata?: fb.MessageMetadata): fb.MessageMetadata | undefined;
export declare function createDescriptors(status: fb.Status, metadata?: fb.MessageMetadata): IDescriptor[];
