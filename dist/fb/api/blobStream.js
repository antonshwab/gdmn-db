"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fb = __importStar(require("node-firebird-native-api"));
const blobObj_1 = require("./blobObj");
const fb_utils_1 = require("./fb-utils");
/** BlobStream implementation. */
class BlobStream {
    constructor(blob, attachment) {
        this.blob = blob;
        this.attachment = attachment;
    }
    get length() {
        if (!this.attachment.client) {
            throw new Error("test");
        }
        return this.attachment.client.statusAction(async (status) => {
            const infoReq = new Uint8Array([fb_utils_1.blobInfo.totalLength]);
            const infoRet = new Uint8Array(20);
            await this.blobHandle.getInfoAsync(status, infoReq.byteLength, infoReq, infoRet.byteLength, infoRet);
            if (infoRet[0] !== fb_utils_1.blobInfo.totalLength || infoRet[1] !== 4 || infoRet[2] !== 0) {
                throw new Error("Unrecognized response from BlobObj::getInfo.");
            }
            return fb_utils_1.getPortableInteger(infoRet.subarray(3), 4);
        });
    }
    static async create(attachment, transaction) {
        if (!attachment.client) {
            throw new Error("test");
        }
        return await attachment.client.statusAction(async (status) => {
            const blobId = new Uint8Array(8);
            const blobHandle = await attachment.attachmentHandle.createBlobAsync(status, transaction.transactionHandle, blobId, 0, undefined);
            const blob = new blobObj_1.BlobObj(attachment, blobId);
            const blobStream = new BlobStream(blob, attachment);
            blobStream.blobHandle = blobHandle;
            return blobStream;
        });
    }
    static async open(attachment, transaction, blob) {
        if (!attachment.client) {
            throw new Error("test");
        }
        return await attachment.client.statusAction(async (status) => {
            const blobStream = new BlobStream(blob, attachment);
            blobStream.blobHandle = await attachment.attachmentHandle.openBlobAsync(status, transaction.transactionHandle, blob.id, 0, undefined);
            return blobStream;
        });
    }
    async close() {
        if (!this.attachment.client) {
            throw new Error("test");
        }
        await this.attachment.client.statusAction((status) => this.blobHandle.closeAsync(status));
        this.blobHandle = undefined;
    }
    async cancel() {
        if (!this.attachment.client) {
            throw new Error("test");
        }
        await this.attachment.client.statusAction((status) => this.blobHandle.cancelAsync(status));
        this.blobHandle = undefined;
    }
    async read(buffer) {
        if (!this.attachment.client) {
            throw new Error("test");
        }
        return await this.attachment.client.statusAction(async (status) => {
            const segLength = new Uint32Array(1);
            const result = await this.blobHandle.getSegmentAsync(status, buffer.length, buffer, segLength);
            if (result === fb.Status.RESULT_NO_DATA) {
                return -1;
            }
            return segLength[0];
        });
    }
    async write(buffer) {
        if (!this.attachment.client) {
            throw new Error("test");
        }
        await this.attachment.client.statusAction((status) => this.blobHandle.putSegmentAsync(status, buffer.length, buffer));
    }
}
exports.BlobStream = BlobStream;
//# sourceMappingURL=blobStream.js.map