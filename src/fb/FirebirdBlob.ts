import {Attachment, Blob, Transaction} from "node-firebird-driver-native";
import {Readable} from "stream";
import {ABlob} from "../ABlob";

export class FirebirdBlob extends ABlob {

    private readonly _connection: Attachment;
    private readonly _transaction: Transaction;
    private readonly _blob: Blob;

    constructor(connection: Attachment, transaction: Transaction, blob: Blob) {
        super();

        this._connection = connection;
        this._transaction = transaction;
        this._blob = blob;
    }

    public async asBuffer(): Promise<null | Buffer> {
        if (this._blob && this._blob instanceof Blob) {
            const blobStream = await this._connection.openBlob(this._transaction, this._blob);
            const length = await blobStream.length;

            const buffers: Buffer[] = [];
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

    public async asStream(): Promise<null | NodeJS.ReadableStream> {
        if (this._blob && this._blob instanceof Blob) {
            const stream = new Readable({read: () => null});
            const blobStream = await this._connection.openBlob(this._transaction, this._blob);
            const length = await blobStream.length;

            const buffers: Buffer[] = [];
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

    public async asString(): Promise<string> {
        const buffer = await this.asBuffer();
        if (buffer) {
            return buffer.toString();
        }
        return "";
    }
}
