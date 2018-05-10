import {Blob, Status} from "node-firebird-native-api";
import {BlobLink} from "./BlobLink";
import {Connection} from "./Connection";
import {Transaction} from "./Transaction";
import {blobInfo, getPortableInteger} from "./utils/fb-utils";

export class BlobStream {

    public connection: Connection;
    public blobLink: BlobLink;
    public handler?: Blob;

    protected constructor(connection: Connection, blobLink: BlobLink, handler?: Blob) {
        this.connection = connection;
        this.blobLink = blobLink;
        this.handler = handler;
    }

    get length(): Promise<number> {
        return this.connection.context.statusAction(async (status) => {
            const infoReq = new Uint8Array([blobInfo.totalLength]);
            const infoRet = new Uint8Array(20);
            await this.handler!.getInfoAsync(status, infoReq.byteLength, infoReq, infoRet.byteLength, infoRet);

            if (infoRet[0] !== blobInfo.totalLength || infoRet[1] !== 4 || infoRet[2] !== 0) {
                throw new Error("Unrecognized response from BlobObj::getInfo.");
            }

            return getPortableInteger(infoRet.subarray(3), 4);
        });
    }

    public static async create(transaction: Transaction): Promise<BlobStream> {
        return await transaction.connection.context.statusAction(async (status) => {
            const blobId = new Uint8Array(8);
            const blobHandler = await transaction.connection.handler!.createBlobAsync(
                status, transaction.handler, blobId, 0, undefined);

            const blobLink = new BlobLink(transaction.connection, blobId);

            return new BlobStream(transaction.connection, blobLink, blobHandler);
        });
    }

    public static async open(transaction: Transaction,
                             blobLink: BlobLink): Promise<BlobStream> {
        return await transaction.connection.context.statusAction(async (status) => {
            const blobHandler = await transaction.connection.handler!.openBlobAsync(
                status, transaction.handler, blobLink.id, 0, undefined);
            return new BlobStream(transaction.connection, blobLink, blobHandler);
        });
    }

    public async close(): Promise<void> {
        await this.connection.context.statusAction((status) => this.handler!.closeAsync(status));
        this.handler = undefined;
    }

    public async cancel(): Promise<void> {
        await this.connection.context.statusAction((status) => this.handler!.cancelAsync(status));
        this.handler = undefined;
    }

    public async read(buffer: Buffer): Promise<number> {
        return await this.connection.context.statusAction(async (status) => {
            const segLength = new Uint32Array(1);
            const result = await this.handler!.getSegmentAsync(status, buffer.length, buffer, segLength);

            if (result === Status.RESULT_NO_DATA) {
                return -1;
            }

            return segLength[0];
        });
    }

    public async write(buffer: Buffer): Promise<void> {
        await this.connection.context.statusAction((status) =>
            this.handler!.putSegmentAsync(status, buffer.length, buffer));
    }
}
