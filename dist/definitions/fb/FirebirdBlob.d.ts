/// <reference types="node" />
import { ABlob } from "../ABlob";
import { FirebirdResultSet } from "./FirebirdResultSet";
export declare class FirebirdBlob extends ABlob {
    readonly parent: FirebirdResultSet;
    readonly blobLink: any;
    constructor(parent: FirebirdResultSet, value: any);
    asBuffer(): Promise<null | Buffer>;
    asStream(): Promise<null | NodeJS.ReadableStream>;
    asString(): Promise<string>;
}
