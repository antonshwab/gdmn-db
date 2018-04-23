import {FirebirdConnection} from "./FirebirdConnection";

export class FirebirdBlobLink {

    public connection: FirebirdConnection;

    /** Gets the blob's id. */
    public readonly id = new Uint8Array(8);

    constructor(connection: FirebirdConnection, id: Uint8Array) {
        this.connection = connection;
        this.id.set(id);
    }
}
