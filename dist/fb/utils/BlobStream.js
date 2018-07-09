"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_native_api_1 = require("node-firebird-native-api");
const BlobLink_1 = require("./BlobLink");
const fb_utils_1 = require("./fb-utils");
class BlobStream {
    constructor(connection, blobLink, handler) {
        this.connection = connection;
        this.blobLink = blobLink;
        this.handler = handler;
    }
    get length() {
        return this.connection.client.statusAction(async (status) => {
            const infoReq = new Uint8Array([fb_utils_1.blobInfo.totalLength]);
            const infoRet = new Uint8Array(20);
            await this.handler.getInfoAsync(status, infoReq.byteLength, infoReq, infoRet.byteLength, infoRet);
            if (infoRet[0] !== fb_utils_1.blobInfo.totalLength || infoRet[1] !== 4 || infoRet[2] !== 0) {
                throw new Error("Unrecognized response from BlobObj::getInfo.");
            }
            return fb_utils_1.getPortableInteger(infoRet.subarray(3), 4);
        });
    }
    static async create(transaction) {
        return await transaction.connection.client.statusAction(async (status) => {
            const blobId = new Uint8Array(8);
            const blobHandler = await transaction.connection.handler.createBlobAsync(status, transaction.handler, blobId, 0, undefined);
            const blobLink = new BlobLink_1.BlobLink(transaction.connection, blobId);
            return new BlobStream(transaction.connection, blobLink, blobHandler);
        });
    }
    static async open(transaction, blobLink) {
        return await transaction.connection.client.statusAction(async (status) => {
            const blobHandler = await transaction.connection.handler.openBlobAsync(status, transaction.handler, blobLink.id, 0, undefined);
            return new BlobStream(transaction.connection, blobLink, blobHandler);
        });
    }
    async close() {
        await this.connection.client.statusAction((status) => this.handler.closeAsync(status));
        this.handler = undefined;
    }
    async cancel() {
        await this.connection.client.statusAction((status) => this.handler.cancelAsync(status));
        this.handler = undefined;
    }
    async read(buffer) {
        return await this.connection.client.statusAction(async (status) => {
            const segLength = new Uint32Array(1);
            const result = await this.handler.getSegmentAsync(status, buffer.length, buffer, segLength);
            if (result === node_firebird_native_api_1.Status.RESULT_NO_DATA) {
                return -1;
            }
            return segLength[0];
        });
    }
    async write(buffer) {
        await this.connection.client.statusAction((status) => this.handler.putSegmentAsync(status, buffer.length, buffer));
    }
}
exports.BlobStream = BlobStream;
//# sourceMappingURL=BlobStream.js.map