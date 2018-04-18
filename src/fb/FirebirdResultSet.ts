import {Attachment, Blob, ResultSet, Transaction} from "node-firebird-driver-native";
import {Readable} from "stream";
import {AResultSet, IRow} from "../AResultSet";

enum Status {
    UNFINISHED, FINISHED, CLOSED
}

export class FirebirdResultSet extends AResultSet {

    private readonly _connection: Attachment;
    private readonly _transaction: Transaction;
    private readonly _resultSet: ResultSet;
    private _data: any[][] = [];
    private _currentIndex: number = AResultSet.NO_INDEX;
    private _status = Status.UNFINISHED;

    constructor(connect: Attachment, transaction: Transaction, resultSet: ResultSet) {
        super();
        this._connection = connect;
        this._transaction = transaction;
        this._resultSet = resultSet;
    }

    get position(): number {
        this._checkClosed();

        return this._currentIndex;
    }

    public async next(): Promise<boolean> {
        this._checkClosed();

        if (this._currentIndex < this._data.length) {
            this._currentIndex++;
            if (this._currentIndex === this._data.length) {
                if (this._status === Status.UNFINISHED) {
                    const newResult = await this._resultSet.fetch({fetchSize: 1});
                    if (newResult.length) {
                        this._data.push(newResult[0]);
                        return true;
                    } else {
                        this._status = Status.FINISHED;
                    }
                }
                return false;
            }
            return true;
        }

        return false;
    }

    public async previous(): Promise<boolean> {
        this._checkClosed();

        if (this._currentIndex > AResultSet.NO_INDEX) {
            this._currentIndex--;
            return this._currentIndex !== AResultSet.NO_INDEX;
        }

        return false;
    }

    public async to(i: number): Promise<boolean> {
        this._checkClosed();

        if (i < AResultSet.NO_INDEX) {
            return false;
        }
        if (this._currentIndex < i) {
            while (await this.next()) {
                if (this._currentIndex === i) {
                    return true;
                }
            }
            return false;
        }

        if (this._currentIndex > i) {
            while (await this.previous()) {
                if (this._currentIndex === i) {
                    return true;
                }
            }
            return false;
        }

        return true;
    }

    public async beforeFirst(): Promise<void> {
        this._checkClosed();

        if (this._status === Status.UNFINISHED) {
            const index = this._currentIndex;
            await this.next();
            await this.to(index);
        }

        if (this._data.length) {
            await this.to(AResultSet.NO_INDEX);
        }
    }

    public async afterLast(): Promise<void> {
        this._checkClosed();

        if (this._status === Status.UNFINISHED) {
            const index = this._currentIndex;
            await this.last();
            await this.to(index);
        }

        if (this._data.length) {
            await this.to(this._data.length);
        }
    }

    public async first(): Promise<boolean> {
        this._checkClosed();

        this._currentIndex = AResultSet.NO_INDEX;
        return await this.next();
    }

    public async last(): Promise<boolean> {
        this._checkClosed();

        while (await this.next()) {
            // nothing
        }

        if (this._data.length) {
            return await this.to(this._data.length - 1);
        }

        return false;
    }

    public async isBeforeFirst(): Promise<boolean> {
        this._checkClosed();

        if (this._currentIndex === AResultSet.NO_INDEX) {
            const firstExists = await this.next();
            await this.previous();
            return firstExists;
        }

        return false;
    }

    public async isAfterLast(): Promise<boolean> {
        this._checkClosed();

        if (this._status === Status.FINISHED) {
            return !!this._data.length && this._currentIndex === this._data.length;
        }

        return false;
    }

    public async isFirst(): Promise<boolean> {
        this._checkClosed();

        return !!this._data.length && this._currentIndex === 0;
    }

    public async isLast(): Promise<boolean> {
        this._checkClosed();

        if (this._currentIndex === AResultSet.NO_INDEX) {
            return false;
        }

        if (this._status === Status.UNFINISHED) {
            await this.next();
            await this.previous();
        }

        return this._currentIndex === this._data.length - 1;
    }

    public async isClosed(): Promise<boolean> {
        return this._status === Status.CLOSED;
    }

    public async close(): Promise<void> {
        this._checkClosed();

        await this._resultSet.close();
        this._status = Status.CLOSED;
        this._data = [];
        this._currentIndex = AResultSet.NO_INDEX;
    }

    public async getBlobBuffer(i: number): Promise<null | Buffer>;
    public async getBlobBuffer(name: string): Promise<null | Buffer>;
    public async getBlobBuffer(field: any): Promise<null | Buffer> {
        if (await this.isNull(field)) {
            return null;
        }
        const value = this._getValue(field);
        if (value instanceof Blob) {
            const blobStream = await this._connection.openBlob(this._transaction, value);
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

    public async getBlobStream(i: number): Promise<null | NodeJS.ReadableStream>;
    public async getBlobStream(name: string): Promise<null | NodeJS.ReadableStream>;
    public async getBlobStream(field: any): Promise<null | NodeJS.ReadableStream> {
        if (await this.isNull(field)) {
            return null;
        }
        const value = this._getValue(field);
        const stream = new Readable({read: () => null});
        if (value instanceof Blob) {
            const blobStream = await this._connection.openBlob(this._transaction, value);
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
        }
        return stream;
    }

    public async getBoolean(i: number): Promise<boolean>;
    public async getBoolean(name: string): Promise<boolean>;
    public async getBoolean(field: any): Promise<boolean> {
        if (await this.isNull(field)) {
            return false;
        }
        let value = this._getValue(field);
        if (value instanceof Blob) {
            const blobBuffer = await this.getBlobBuffer(field);
            if (blobBuffer) {
                value = blobBuffer.toString("utf-8");
            }
        }
        return Boolean(value);
    }

    public async getDate(i: number): Promise<null | Date>;
    public async getDate(name: string): Promise<null | Date>;
    public async getDate(field: any): Promise<null | Date> {
        if (await this.isNull(field)) {
            return null;
        }
        let value = this._getValue(field);
        if (value instanceof Blob) {
            const blobBuffer = await this.getBlobBuffer(field);
            if (blobBuffer) {
                value = blobBuffer.toString("utf-8");
            }
        }
        return new Date(value);
    }

    public async getNumber(i: number): Promise<number>;
    public async getNumber(name: string): Promise<number>;
    public async getNumber(field: any): Promise<number> {
        if (await this.isNull(field)) {
            return 0;
        }
        let value = this._getValue(field);
        if (value instanceof Blob) {
            const blobBuffer = await this.getBlobBuffer(field);
            if (blobBuffer) {
                value = blobBuffer.toString("utf-8");
            }
        }
        return Number.parseFloat(value);
    }

    public async getString(i: number): Promise<string>;
    public async getString(name: string): Promise<string>;
    public async getString(field: any): Promise<string> {
        if (await this.isNull(field)) {
            return "";
        }
        let value = this._getValue(field);
        if (value instanceof Blob) {
            const blobBuffer = await this.getBlobBuffer(field);
            if (blobBuffer) {
                value = blobBuffer.toString("utf-8");
            }
        }
        return String(value);
    }

    public async getAny(i: number): Promise<any>;
    public async getAny(name: string): Promise<any>;
    public async getAny(field: any): Promise<any> {
        return this._getValue(field);
    }

    public async isNull(i: number): Promise<boolean>;
    public async isNull(name: string): Promise<boolean>;
    public async isNull(field: any): Promise<boolean> {
        const value = this._getValue(field);
        return value === null || value === undefined;
    }

    public async getObject(): Promise<IRow> {
        const array = await this.getArray();
        return array.reduce((object, item, index) => {
            object[index] = item;
            return object;
        }, {});
    }

    public async getArray(): Promise<any[]> {
        this._checkClosed();

        return this._data[this._currentIndex];
    }

    public async getObjects(): Promise<IRow[]> {
        const arrays = await this.getArrays();
        return arrays.map((array) => array.reduce((object, item, index) => {
            object[index] = item;
            return object;
        }, {}));
    }

    public async getArrays(): Promise<any[][]> {
        this._checkClosed();

        // loading all rows
        if (this._status === Status.UNFINISHED) {
            while (await this.next()) {
                // nothing
            }
        }
        return this._data;
    }

    private _getValue(field: number | string): any {
        this._checkClosed();

        const row = this._data[this._currentIndex];
        if (typeof field === "number") {
            return row[field];
        } else {
            throw new Error("Not supported yet");
        }
    }

    private _checkClosed(): void {
        if (this._status === Status.CLOSED) {
            throw new Error("ResultSet is closed");
        }
    }
}
