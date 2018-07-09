/// <reference types="node" />
import { Blob } from "node-firebird-native-api";
import { Connection } from "../Connection";
import { Transaction } from "../Transaction";
import { BlobLink } from "./BlobLink";
export declare class BlobStream {
    connection: Connection;
    blobLink: BlobLink;
    handler?: Blob;
    protected constructor(connection: Connection, blobLink: BlobLink, handler?: Blob);
    readonly length: Promise<number>;
    static create(transaction: Transaction): Promise<BlobStream>;
    static open(transaction: Transaction, blobLink: BlobLink): Promise<BlobStream>;
    close(): Promise<void>;
    cancel(): Promise<void>;
    read(buffer: Buffer): Promise<number>;
    write(buffer: Buffer): Promise<void>;
}
