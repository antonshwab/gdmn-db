"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BlobObj {
    constructor(attachment, id) {
        /** Gets the blob's id. */
        this.id = new Uint8Array(8);
        this.attachment = attachment;
        this.id.set(id);
    }
}
exports.BlobObj = BlobObj;
//# sourceMappingURL=blobObj.js.map