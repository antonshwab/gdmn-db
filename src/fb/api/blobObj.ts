import {Attachment} from "./attachment";

export class BlobObj {
    /** Gets the blob's attachment. */
    public readonly attachment: Attachment;

    /** Gets the blob's id. */
    public readonly id = new Uint8Array(8);

    constructor(attachment: Attachment, id: Uint8Array) {
        this.attachment = attachment;
        this.id.set(id);
    }
}
