import {Readable} from "stream";
import {ABlob} from "../ABlob";
import {BlobLink} from "./BlobLink";
import {BlobStream} from "./BlobStream";
import {ResultSet} from "./ResultSet";

export class BlobImpl extends ABlob {

    public readonly blobLink: any;

    constructor(resultSet: ResultSet, value: any) {
        super(resultSet);
        this.blobLink = value;
    }

    get resultSet(): ResultSet {
        return super.resultSet as ResultSet;
    }

    public async asBuffer(): Promise<null | Buffer> {
        if (this.blobLink && this.blobLink instanceof BlobLink) {
            const blobStream = await BlobStream.open(this.resultSet.statement.transaction, this.blobLink);
            try {
                const length = await blobStream.length;

                const buffers: Buffer[] = [];
                for (let i = 0; i < length; i++) {  // TODO
                    const buffer = Buffer.alloc(1);
                    buffers.push(buffer);
                    await blobStream.read(buffer);
                }
                return Buffer.concat(buffers, length);

            } catch (error) {
                if (blobStream) {
                    await blobStream.cancel();
                }
                throw error;
            } finally {
                if (blobStream) {
                    await blobStream.close();
                }
            }
        }
        return null;
    }

    public async asStream(): Promise<null | NodeJS.ReadableStream> {
        if (this.blobLink && this.blobLink instanceof BlobLink) {
            const stream = new Readable({read: () => null});
            const blobStream = await BlobStream.open(this.resultSet.statement.transaction, this.blobLink);
            try {
                const length = await blobStream.length;

                const buffers: Buffer[] = [];
                for (let i = 0; i < length; i++) {  // TODO
                    buffers.push(Buffer.alloc(1));
                }
                const promises = buffers.map(async (buffer) => {
                    await blobStream.read(buffer);
                    stream.push(buffer);
                });
                Promise.all(promises).then(() => stream.push(null)).catch(console.warn);

                return stream;
            } catch (error) {
                if (blobStream) {
                    await blobStream.cancel();
                }
                throw error;
            } finally {
                if (blobStream) {
                    await blobStream.close();
                }
            }
        }
        return null;
    }

    public async asString(): Promise<string> {
        const buffer = await this.asBuffer();
        if (buffer) {
            return buffer.toString();
        }
        return "";
    }
}
