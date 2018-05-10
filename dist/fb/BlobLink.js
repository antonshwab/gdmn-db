"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BlobLink {
    constructor(connection, id) {
        /** Gets the blob's id. */
        this.id = new Uint8Array(8);
        this.connection = connection;
        this.id.set(id);
    }
}
exports.BlobLink = BlobLink;
//# sourceMappingURL=BlobLink.js.map