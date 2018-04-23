/// <reference types="node" />
import { Blob } from "node-firebird-native-api";
import { FirebirdBlobLink } from "./FirebirdBlobLink";
import { FirebirdConnection } from "./FirebirdConnection";
import { FirebirdTransaction } from "./FirebirdTransaction";
export declare class FirebirdBlobStream {
    connection: FirebirdConnection;
    blobLink: FirebirdBlobLink;
    handler?: Blob;
    protected constructor(connection: FirebirdConnection, blobLink: FirebirdBlobLink, handler?: Blob);
    readonly length: Promise<number>;
    static create(transaction: FirebirdTransaction): Promise<FirebirdBlobStream>;
    static open(transaction: FirebirdTransaction, blobLink: FirebirdBlobLink): Promise<FirebirdBlobStream>;
    close(): Promise<void>;
    cancel(): Promise<void>;
    read(buffer: Buffer): Promise<number>;
    write(buffer: Buffer): Promise<void>;
}
