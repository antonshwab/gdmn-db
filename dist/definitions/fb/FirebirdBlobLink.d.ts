import { FirebirdConnection } from "./FirebirdConnection";
export declare class FirebirdBlobLink {
    connection: FirebirdConnection;
    /** Gets the blob's id. */
    readonly id: Uint8Array;
    constructor(connection: FirebirdConnection, id: Uint8Array);
}
