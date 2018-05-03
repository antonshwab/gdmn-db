import {Readable} from "stream";
import {ABlob} from "../ABlob";
import {FirebirdBlobLink} from "./FirebirdBlobLink";
import {FirebirdBlobStream} from "./FirebirdBlobStream";
import {FirebirdResultSet} from "./FirebirdResultSet";

export class FirebirdBlob extends ABlob {

    public readonly parent: FirebirdResultSet;
    public readonly blobLink: any;

    constructor(parent: FirebirdResultSet, value: any) {
        super();
        this.parent = parent;
        this.blobLink = value;
    }

    public async asBuffer(): Promise<null | Buffer> {
        if (this.blobLink && this.blobLink instanceof FirebirdBlobLink) {
            const blobStream = await FirebirdBlobStream.open(this.parent.parent.parent, this.blobLink);
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
        if (this.blobLink && this.blobLink instanceof FirebirdBlobLink) {
            const stream = new Readable({read: () => null});
            const blobStream = await FirebirdBlobStream.open(this.parent.parent.parent, this.blobLink);
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
