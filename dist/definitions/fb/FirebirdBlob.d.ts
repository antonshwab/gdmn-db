/// <reference types="node" />
import { ABlob } from "../ABlob";
import { Attachment } from "./api/attachment";
import { BlobObj as Blob } from "./api/blobObj";
import { Transaction } from "./api/transaction";
export declare class FirebirdBlob extends ABlob {
    private readonly _connection;
    private readonly _transaction;
    private readonly _blob;
    constructor(connection: Attachment, transaction: Transaction, blob: Blob);
    asBuffer(): Promise<null | Buffer>;
    asStream(): Promise<null | NodeJS.ReadableStream>;
    asString(): Promise<string>;
}
