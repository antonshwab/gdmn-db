import {Attachment, Blob, ResultSet, Transaction} from "node-firebird-driver-native";
import {Readable} from "stream";
import {AResultSet, IRow} from "../AResultSet";

enum Status {
    UNFINISHED, FINISHED, CLOSED
}

export class FirebirdResultSet extends AResultSet {

    private readonly _connect: Attachment;
    private readonly _transaction: Transaction;
    private readonly _resultSet: ResultSet;
    private _data: any[][] = [];
    private _currentIndex: number = -1;
    private _status = Status.UNFINISHED;

    constructor(connect: Attachment, transaction: Transaction, resultSet: ResultSet) {
        super();
        this._connect = connect;
        this._transaction = transaction;
        this._resultSet = resultSet;
    }

    get position(): number {
        return this._currentIndex;
    }

    public async next(): Promise<boolean> {
        if (this._currentIndex < this._data.length - 1) {
            this._currentIndex++;
            return true;
        }

        // loading next row
        if (this._status === Status.UNFINISHED) {
            const newResult = await this._resultSet.fetch({fetchSize: 1});
            if (newResult.length) {
                this._data.push(newResult[0]);
            } else {
                this._status = Status.FINISHED;
            }
            return await this.next();
        }
        return false;
    }

    public async previous(): Promise<boolean> {
        if (this._currentIndex > 0) {
            this._currentIndex--;
            return true;
        }
        return false;
    }

    public async to(i: number): Promise<boolean> {
        if (i < this._data.length && i >= 0) {
            this._currentIndex = i;
            return true;
        }

        // loading all rows
        if (this._status === Status.UNFINISHED) {
            while (await this.next()) {
                if (this._currentIndex === i) {
                    return true;
                }
            }
        }
        return false;
    }

    public async first(): Promise<boolean> {
        if (this._data.length) {
            this._currentIndex = 0;
            return true;
        }
        return false;
    }

    public async last(): Promise<boolean> {
        // loading all rows
        if (this._status === Status.UNFINISHED) {
            while (await this.next()) {
                // nothing
            }
        }

        if (this._data.length) {
            this._currentIndex = this._data.length - 1;
            return true;
        }
        return false;
    }

    public async isFirst(): Promise<boolean> {
        return this._currentIndex === 0;
    }

    public async isLast(): Promise<boolean> {
        // loading and check next
        if (this._status === Status.UNFINISHED) {
            if (await this.next()) {
                this._currentIndex--;
                // await this.previous();
                return false;
            } else {
                return true;
            }
        }

        return this._currentIndex === this._data.length - 1;
    }

    public async isClosed(): Promise<boolean> {
        return this._status === Status.CLOSED;
    }

    public async close(): Promise<void> {
        await this._resultSet.close();
        this._status = Status.CLOSED;
        this._data = [];
        this._currentIndex = -1;
    }

    public async getBlobBuffer(i: number): Promise<null | Buffer>;
    public async getBlobBuffer(name: string): Promise<null | Buffer>;
    public async getBlobBuffer(field: number | string): Promise<null | Buffer> {
        const value = this._getValue(field);
        if (value === null || value === undefined) {
            return null;
        }
        if (value instanceof Blob) {
            const blobStream = await this._connect.openBlob(this._transaction, value);
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
    public async getBlobStream(field: number | string): Promise<null | NodeJS.ReadableStream> {
        const value = this._getValue(field);
        if (value === null || value === undefined) {
            return null;
        }
        const stream = new Readable({read: () => null});
        if (value instanceof Blob) {
            const blobStream = await this._connect.openBlob(this._transaction, value);
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

    public getBoolean(i: number): null | boolean;
    public getBoolean(name: string): null | boolean;
    public getBoolean(field: number | string): null | boolean {
        const value = this._getValue(field);
        if (value === null || value === undefined) {
            return null;
        }
        return Boolean(this._getValue(field));
    }

    public getDate(i: number): null | Date;
    public getDate(name: string): null | Date;
    public getDate(field: number | string): null | Date {
        const value = this._getValue(field);
        if (value === null || value === undefined) {
            return null;
        }
        return new Date(value);
    }

    public getNumber(i: number): null | number;
    public getNumber(name: string): null | number;
    public getNumber(field: number | string): null | number {
        const value = this._getValue(field);
        if (value === null || value === undefined) {
            return null;
        }
        return Number.parseFloat(value);
    }

    public getString(i: number): null | string;
    public getString(name: string): null | string;
    public getString(field: number | string): null | string {
        const value = this._getValue(field);
        if (value === null || value === undefined) {
            return null;
        }
        return String(value);
    }

    public getAny(i: number): any;
    public getAny(name: string): any;
    public getAny(field: number | string): any {
        return this._getValue(field);
    }

    public getObject(): IRow {
        return this.getArray().reduce((object, item, index) => {
            object[index] = item;
            return object;
        }, {});
    }

    public getArray(): any[] {
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
        // loading all rows
        if (this._status === Status.UNFINISHED) {
            while (await this.next()) {
                // nothing
            }
        }
        return this._data;
    }

    private _getValue(field: number | string): any {
        const row = this._data[this._currentIndex];
        if (typeof field === "number") {
            return row[field];
        } else {
            throw new Error("Not supported yet");
        }
    }
}
