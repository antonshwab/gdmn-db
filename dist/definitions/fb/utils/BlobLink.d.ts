import { Connection } from "../Connection";
export declare class BlobLink {
    connection: Connection;
    /** Gets the blob's id. */
    readonly id: Uint8Array;
    constructor(connection: Connection, id: Uint8Array);
}
