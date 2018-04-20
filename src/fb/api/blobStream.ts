import * as fb from "node-firebird-native-api";
import {Attachment} from "./attachment";
import {BlobObj} from "./blobObj";
import {blobInfo, getPortableInteger} from "./fb-utils";
import {Transaction} from "./transaction";

/** BlobStream implementation. */
export class BlobStream {

    public blobHandle?: fb.Blob;

    protected constructor(public blob: BlobObj, public attachment: Attachment) {
    }

    get length(): Promise<number> {
        if (!this.attachment.client) {
            throw new Error("test");
        }

        return this.attachment.client.statusAction(async (status) => {
            const infoReq = new Uint8Array([blobInfo.totalLength]);
            const infoRet = new Uint8Array(20);
            await this.blobHandle!.getInfoAsync(status, infoReq.byteLength, infoReq, infoRet.byteLength, infoRet);

            if (infoRet[0] !== blobInfo.totalLength || infoRet[1] !== 4 || infoRet[2] !== 0) {
                throw new Error("Unrecognized response from BlobObj::getInfo.");
            }

            return getPortableInteger(infoRet.subarray(3), 4);
        });
    }

    public static async create(attachment: Attachment,
                               transaction: Transaction): Promise<BlobStream> {
        if (!attachment.client) {
            throw new Error("test");
        }

        return await attachment.client.statusAction(async (status) => {
            const blobId = new Uint8Array(8);
            const blobHandle = await attachment.attachmentHandle!.createBlobAsync(
                status, transaction.transactionHandle, blobId, 0, undefined);

            const blob = new BlobObj(attachment, blobId);

            const blobStream = new BlobStream(blob, attachment);
            blobStream.blobHandle = blobHandle;
            return blobStream;
        });
    }

    public static async open(attachment: Attachment,
                             transaction: Transaction,
                             blob: BlobObj): Promise<BlobStream> {
        if (!attachment.client) {
            throw new Error("test");
        }

        return await attachment.client.statusAction(async (status) => {
            const blobStream = new BlobStream(blob, attachment);
            blobStream.blobHandle = await attachment.attachmentHandle!.openBlobAsync(
                status, transaction.transactionHandle, blob.id, 0, undefined);
            return blobStream;
        });
    }

    public async close(): Promise<void> {
        if (!this.attachment.client) {
            throw new Error("test");
        }

        await this.attachment.client.statusAction((status) => this.blobHandle!.closeAsync(status));
        this.blobHandle = undefined;
    }

    public async cancel(): Promise<void> {
        if (!this.attachment.client) {
            throw new Error("test");
        }

        await this.attachment.client.statusAction((status) => this.blobHandle!.cancelAsync(status));
        this.blobHandle = undefined;
    }

    public async read(buffer: Buffer): Promise<number> {
        if (!this.attachment.client) {
            throw new Error("test");
        }

        return await this.attachment.client.statusAction(async (status) => {
            const segLength = new Uint32Array(1);
            const result = await this.blobHandle!.getSegmentAsync(status, buffer.length, buffer, segLength);

            if (result === fb.Status.RESULT_NO_DATA) {
                return -1;
            }

            return segLength[0];
        });
    }

    public async write(buffer: Buffer): Promise<void> {
        await this.attachment!.client!.statusAction((status) =>
            this.blobHandle!.putSegmentAsync(status, buffer.length, buffer));
    }
}
