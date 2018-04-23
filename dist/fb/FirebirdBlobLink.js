"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FirebirdBlobLink {
    constructor(connection, id) {
        /** Gets the blob's id. */
        this.id = new Uint8Array(8);
        this.connection = connection;
        this.id.set(id);
    }
}
exports.FirebirdBlobLink = FirebirdBlobLink;
//# sourceMappingURL=FirebirdBlobLink.js.map