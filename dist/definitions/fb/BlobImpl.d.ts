/// <reference types="node" />
import { ABlob, SequentiallyCallback } from "../ABlob";
import { ResultSet } from "./ResultSet";
export declare class BlobImpl extends ABlob {
    readonly blobLink: any;
    constructor(resultSet: ResultSet, value: any);
    readonly resultSet: ResultSet;
    sequentially(callback: SequentiallyCallback): Promise<void>;
    asBuffer(): Promise<null | Buffer>;
    asString(): Promise<string>;
}
