"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ABlob_1 = require("../ABlob");
const BlobLink_1 = require("./utils/BlobLink");
const BlobStream_1 = require("./utils/BlobStream");
class BlobImpl extends ABlob_1.ABlob {
    constructor(transaction, value) {
        super(transaction);
        this.blobLink = value;
    }
    get transaction() {
        return super.transaction;
    }
    async sequentially(callback) {
        if (this.blobLink && this.blobLink instanceof BlobLink_1.BlobLink) {
            const blobStream = await BlobStream_1.BlobStream.open(this.transaction, this.blobLink);
            try {
                const length = await blobStream.length;
                for (let i = 0; i < length; i++) {
                    const buffer = Buffer.alloc(1);
                    await blobStream.read(buffer);
                    await callback(buffer);
                }
            }
            catch (error) {
                if (blobStream) {
                    await blobStream.cancel();
                }
                throw error;
            }
            finally {
                if (blobStream) {
                    await blobStream.close();
                }
            }
        }
    }
    async asBuffer() {
        if (this.blobLink && this.blobLink instanceof BlobLink_1.BlobLink) {
            const blobStream = await BlobStream_1.BlobStream.open(this.transaction, this.blobLink);
            try {
                const length = await blobStream.length;
                const buffers = [];
                for (let i = 0; i < length; i++) {
                    const buffer = Buffer.alloc(1);
                    buffers.push(buffer);
                    await blobStream.read(buffer);
                }
                return Buffer.concat(buffers, length);
            }
            catch (error) {
                if (blobStream) {
                    await blobStream.cancel();
                }
                throw error;
            }
            finally {
                if (blobStream) {
                    await blobStream.close();
                }
            }
        }
        return null;
    }
    async asString() {
        const buffer = await this.asBuffer();
        if (buffer) {
            return buffer.toString();
        }
        return "";
    }
}
exports.BlobImpl = BlobImpl;
//# sourceMappingURL=BlobImpl.js.map