"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const ABlob_1 = require("../ABlob");
const BlobLink_1 = require("./BlobLink");
const BlobStream_1 = require("./BlobStream");
class BlobImpl extends ABlob_1.ABlob {
    constructor(resultSet, value) {
        super(resultSet);
        this.blobLink = value;
    }
    get resultSet() {
        return super.resultSet;
    }
    async asBuffer() {
        if (this.blobLink && this.blobLink instanceof BlobLink_1.BlobLink) {
            const blobStream = await BlobStream_1.BlobStream.open(this.resultSet.statement.transaction, this.blobLink);
            try {
                const length = await blobStream.length;
                const buffers = [];
                for (let i = 0; i < length; i++) { // TODO
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
    async asStream() {
        if (this.blobLink && this.blobLink instanceof BlobLink_1.BlobLink) {
            const stream = new stream_1.Readable({ read: () => null });
            const blobStream = await BlobStream_1.BlobStream.open(this.resultSet.statement.transaction, this.blobLink);
            try {
                const length = await blobStream.length;
                const buffers = [];
                for (let i = 0; i < length; i++) { // TODO
                    buffers.push(Buffer.alloc(1));
                }
                const promises = buffers.map(async (buffer) => {
                    await blobStream.read(buffer);
                    stream.push(buffer);
                });
                Promise.all(promises).then(() => stream.push(null)).catch(console.warn);
                return stream;
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