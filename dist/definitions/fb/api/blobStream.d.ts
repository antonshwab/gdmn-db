/// <reference types="node" />
import * as fb from "node-firebird-native-api";
import { Attachment } from "./attachment";
import { BlobObj } from "./blobObj";
import { Transaction } from "./transaction";
/** BlobStream implementation. */
export declare class BlobStream {
    blob: BlobObj;
    attachment: Attachment;
    blobHandle?: fb.Blob;
    protected constructor(blob: BlobObj, attachment: Attachment);
    readonly length: Promise<number>;
    static create(attachment: Attachment, transaction: Transaction): Promise<BlobStream>;
    static open(attachment: Attachment, transaction: Transaction, blob: BlobObj): Promise<BlobStream>;
    close(): Promise<void>;
    cancel(): Promise<void>;
    read(buffer: Buffer): Promise<number>;
    write(buffer: Buffer): Promise<void>;
}
