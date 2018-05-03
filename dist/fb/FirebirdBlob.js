"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const ABlob_1 = require("../ABlob");
const FirebirdBlobLink_1 = require("./FirebirdBlobLink");
const FirebirdBlobStream_1 = require("./FirebirdBlobStream");
class FirebirdBlob extends ABlob_1.ABlob {
    constructor(parent, value) {
        super();
        this.parent = parent;
        this.blobLink = value;
    }
    async asBuffer() {
        if (this.blobLink && this.blobLink instanceof FirebirdBlobLink_1.FirebirdBlobLink) {
            const blobStream = await FirebirdBlobStream_1.FirebirdBlobStream.open(this.parent.parent.parent, this.blobLink);
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
        if (this.blobLink && this.blobLink instanceof FirebirdBlobLink_1.FirebirdBlobLink) {
            const stream = new stream_1.Readable({ read: () => null });
            const blobStream = await FirebirdBlobStream_1.FirebirdBlobStream.open(this.parent.parent.parent, this.blobLink);
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
exports.FirebirdBlob = FirebirdBlob;
//# sourceMappingURL=FirebirdBlob.js.map