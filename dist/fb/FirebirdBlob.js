"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {Attachment, Blob, Transaction} from "node-firebird-driver-native";
const stream_1 = require("stream");
const ABlob_1 = require("../ABlob");
const blobObj_1 = require("./api/blobObj");
class FirebirdBlob extends ABlob_1.ABlob {
    constructor(connection, transaction, blob) {
        super();
        this._connection = connection;
        this._transaction = transaction;
        this._blob = blob;
    }
    async asBuffer() {
        if (this._blob && this._blob instanceof blobObj_1.BlobObj) {
            const blobStream = await this._connection.openBlob(this._transaction, this._blob);
            const length = await blobStream.length;
            const buffers = [];
            let i = 0;
            while (i < length) {
                const size = length - i < 1024 * 16 ? length - i : 1024 * 16;
                i += size;
                const buffer = Buffer.alloc(size);
                buffers.push(buffer);
                await blobStream.read(buffer);
            }
            return Buffer.concat(buffers, length);
        }
        return null;
    }
    async asStream() {
        if (this._blob && this._blob instanceof blobObj_1.BlobObj) {
            const stream = new stream_1.Readable({ read: () => null });
            const blobStream = await this._connection.openBlob(this._transaction, this._blob);
            const length = await blobStream.length;
            const buffers = [];
            let i = 0;
            while (i < length) {
                const size = length - i < 1024 * 16 ? length - i : 1024 * 16;
                i += size;
                buffers.push(Buffer.alloc(size));
            }
            const promises = buffers.map(async (buffer) => {
                await blobStream.read(buffer);
                stream.push(buffer);
            });
            Promise.all(promises).then(() => stream.push(null)).catch(console.warn);
            return stream;
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