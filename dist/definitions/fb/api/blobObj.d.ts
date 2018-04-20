import { Attachment } from "./attachment";
export declare class BlobObj {
    /** Gets the blob's attachment. */
    readonly attachment: Attachment;
    /** Gets the blob's id. */
    readonly id: Uint8Array;
    constructor(attachment: Attachment, id: Uint8Array);
}
