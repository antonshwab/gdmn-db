"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_native_api_1 = require("node-firebird-native-api");
const FirebirdBlobLink_1 = require("./FirebirdBlobLink");
const fb_utils_1 = require("./utils/fb-utils");
class FirebirdBlobStream {
    constructor(connection, blobLink, handler) {
        this.connection = connection;
        this.blobLink = blobLink;
        this.handler = handler;
    }
    get length() {
        return this.connection.context.statusAction(async (status) => {
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
        return await transaction.parent.context.statusAction(async (status) => {
            const blobId = new Uint8Array(8);
            const blobHandler = await transaction.parent.handler.createBlobAsync(status, transaction.handler, blobId, 0, undefined);
            const blobLink = new FirebirdBlobLink_1.FirebirdBlobLink(transaction.parent, blobId);
            return new FirebirdBlobStream(transaction.parent, blobLink, blobHandler);
        });
    }
    static async open(transaction, blobLink) {
        return await transaction.parent.context.statusAction(async (status) => {
            const blobHandler = await transaction.parent.handler.openBlobAsync(status, transaction.handler, blobLink.id, 0, undefined);
            return new FirebirdBlobStream(transaction.parent, blobLink, blobHandler);
        });
    }
    async close() {
        await this.connection.context.statusAction((status) => this.handler.closeAsync(status));
        this.handler = undefined;
    }
    async cancel() {
        await this.connection.context.statusAction((status) => this.handler.cancelAsync(status));
        this.handler = undefined;
    }
    async read(buffer) {
        return await this.connection.context.statusAction(async (status) => {
            const segLength = new Uint32Array(1);
            const result = await this.handler.getSegmentAsync(status, buffer.length, buffer, segLength);
            if (result === node_firebird_native_api_1.Status.RESULT_NO_DATA) {
                return -1;
            }
            return segLength[0];
        });
    }
    async write(buffer) {
        await this.connection.context.statusAction((status) => this.handler.putSegmentAsync(status, buffer.length, buffer));
    }
}
exports.FirebirdBlobStream = FirebirdBlobStream;
//# sourceMappingURL=FirebirdBlobStream.js.map