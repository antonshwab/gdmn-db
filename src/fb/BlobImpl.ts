import {ABlob, SequentiallyCallback} from "../ABlob";
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

    public async sequentially(callback: SequentiallyCallback): Promise<void> {
        if (this.blobLink && this.blobLink instanceof BlobLink) {
            const blobStream = await BlobStream.open(this.resultSet.statement.transaction, this.blobLink);
            try {
                const length = await blobStream.length;

                for (let i = 0; i < length; i++) {
                    const buffer = Buffer.alloc(1);
                    await blobStream.read(buffer);
                    await callback(buffer);
                }

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
    }

    public async asBuffer(): Promise<null | Buffer> {
        if (this.blobLink && this.blobLink instanceof BlobLink) {
            const blobStream = await BlobStream.open(this.resultSet.statement.transaction, this.blobLink);
            try {
                const length = await blobStream.length;

                const buffers: Buffer[] = [];
                for (let i = 0; i < length; i++) {
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

    public async asString(): Promise<string> {
        const buffer = await this.asBuffer();
        if (buffer) {
            return buffer.toString();
        }
        return "";
    }
}
