/// <reference types="node" />
import { Attachment, Blob, Transaction } from "node-firebird-driver-native";
import { ABlob } from "../ABlob";
export declare class FirebirdBlob extends ABlob {
    private readonly _connection;
    private readonly _transaction;
    private readonly _blob;
    constructor(connection: Attachment, transaction: Transaction, blob: Blob);
    getBuffer(): Promise<null | Buffer>;
    getStream(): Promise<null | NodeJS.ReadableStream>;
    getString(): Promise<string>;
}
