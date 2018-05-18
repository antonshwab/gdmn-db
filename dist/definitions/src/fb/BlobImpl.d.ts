/// <reference types="node" />
import { ABlob } from "../ABlob";
import { ResultSet } from "./ResultSet";
export declare class BlobImpl extends ABlob {
    readonly blobLink: any;
    constructor(resultSet: ResultSet, value: any);
    readonly resultSet: ResultSet;
    asBuffer(): Promise<null | Buffer>;
    asStream(): Promise<null | NodeJS.ReadableStream>;
    asString(): Promise<string>;
}
