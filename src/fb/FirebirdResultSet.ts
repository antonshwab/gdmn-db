import {AResultSet, IRow} from "../AResultSet";
import {Attachment} from "./api/attachment";
import {ResultSet} from "./api/resultSet";
import {Transaction} from "./api/transaction";
import {FirebirdBlob} from "./FirebirdBlob";

enum Status {
    UNFINISHED, FINISHED, CLOSED
}

export class FirebirdResultSet extends AResultSet<FirebirdBlob> {

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

    public getBlob(i: number): FirebirdBlob;
    public getBlob(name: string): FirebirdBlob;
    public getBlob(field: any): FirebirdBlob {
        return new FirebirdBlob(this._connection, this._transaction, this._getValue(field));
    }

    public getBoolean(i: number): boolean;
    public getBoolean(name: string): boolean;
    public getBoolean(field: any): boolean {
        this._throwIfBlob(field);

        if (this.isNull(field)) {
            return false;
        }
        return Boolean(this._getValue(field));
    }

    public getDate(i: number): null | Date;
    public getDate(name: string): null | Date;
    public getDate(field: any): null | Date {
        this._throwIfBlob(field);

        if (this.isNull(field)) {
            return null;
        }
        return new Date(this._getValue(field));
    }

    public getNumber(i: number): number;
    public getNumber(name: string): number;
    public getNumber(field: any): number {
        this._throwIfBlob(field);

        if (this.isNull(field)) {
            return 0;
        }
        return Number.parseFloat(this._getValue(field));
    }

    public getString(i: number): string;
    public getString(name: string): string;
    public getString(field: any): string {
        this._throwIfBlob(field);

        if (this.isNull(field)) {
            return "";
        }
        return String(this._getValue(field));
    }

    public getAny(i: number): any;
    public getAny(name: string): any;
    public getAny(field: any): any {
        return this._getValue(field);
    }

    public isNull(i: number): boolean;
    public isNull(name: string): boolean;
    public isNull(field: any): boolean {
        const value = this._getValue(field);
        return value === null || value === undefined;
    }

    public getObject(): IRow {
        const array = this.getArray();
        return array.reduce((object, item, index) => {
            object[index] = item;
            return object;
        }, {});
    }

    public getArray(): any[] {
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

    private _throwIfBlob(field: number | string): void {
        if (this._getValue(field) instanceof Blob) {
            throw new Error("Invalid typecasting");
        }
    }
}
