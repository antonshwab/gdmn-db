import * as fb from "node-firebird-native-api";
import {ResultSet as NativeResultSet} from "node-firebird-native-api";
import {AResultSet} from "../AResultSet";
import {FirebirdBlob} from "./FirebirdBlob";
import {FirebirdBlobLink} from "./FirebirdBlobLink";
import {FirebirdStatement} from "./FirebirdStatement";
import {IDescriptor, SQL_BLOB_SUB_TYPE} from "./utils/fb-utils";

enum Status {
    UNFINISHED, FINISHED
}

export class FirebirdResultSet extends AResultSet<FirebirdBlob> {

    public readonly parent: FirebirdStatement;
    public disposeStatementOnClose: boolean = false;
    private _handler?: NativeResultSet;

    private _data: any[][] = [];
    private _currentIndex: number = AResultSet.NO_INDEX;
    private _status = Status.UNFINISHED;

    protected constructor(parent: FirebirdStatement, handler: NativeResultSet) {
        super();
        this.parent = parent;
        this._handler = handler;
        this.parent.resultSets.add(this);
    }

    get position(): number {
        this._checkClosed();

        return this._currentIndex;
    }

    public static async open(parent: FirebirdStatement): Promise<FirebirdResultSet> {
        const handler = await parent.parent.parent.context.statusAction((status) =>
            parent.source!.handler.openCursorAsync(status, parent.parent.handler, parent.source!.inMetadata,
                parent.source!.inBuffer, parent.source!.outMetadata, 0));
        return new FirebirdResultSet(parent, handler!);
    }

    public async next(): Promise<boolean> {
        this._checkClosed();

        if (this._currentIndex < this._data.length) {
            this._currentIndex++;
            if (this._currentIndex === this._data.length) {
                if (this._status === Status.UNFINISHED) {
                    const newResult = await this._fetch({fetchSize: 1});
                    if (newResult) {
                        this._data.push(newResult[0]);
                        return true;
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
        return !this._handler;
    }

    public async close(): Promise<void> {
        this._checkClosed();

        await this.parent.parent.parent.context.statusAction((status) => this._handler!.closeAsync(status));
        this._handler = undefined;
        this._data = [];
        this._currentIndex = AResultSet.NO_INDEX;
        this.parent.resultSets.delete(this);

        if (this.disposeStatementOnClose) {
            await this.parent.dispose();
        }
    }

    public getBlob(i: number): FirebirdBlob;
    public getBlob(name: string): FirebirdBlob;
    public getBlob(field: any): FirebirdBlob {
        return new FirebirdBlob(this, this._getValue(field));
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
        const date = new Date(this._getValue(field));
        return isNaN(date.getTime()) ? null : date;
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

    public async getAny(i: number): Promise<any>;
    public async getAny(name: string): Promise<any>;
    public async getAny(field: any): Promise<any> {
        const value = this._getValue(field);
        if (value instanceof FirebirdBlobLink) {
            const descriptor = this.getDescriptor(field);
            if (descriptor.subType === SQL_BLOB_SUB_TYPE.TEXT) {
                return await this.getBlob(field).asString();
            } else {
                return await this.getBlob(field).asBuffer();
            }
        }
        return value;
    }

    public isNull(i: number): boolean;
    public isNull(name: string): boolean;
    public isNull(field: any): boolean {
        const value = this._getValue(field);
        return value === null || value === undefined;
    }

    private _getValue(field: number | string): any {
        this._checkClosed();

        const row = this._data[this._currentIndex];
        if (typeof field === "number") {
            return row[field];
        } else {
            const index = this.parent.source!.outDescriptors.findIndex((descriptor) => descriptor.alias === field);
            return row[index];
        }
    }

    private getDescriptor(field: number | string): IDescriptor {
        const descriptors = this.parent.source!.outDescriptors;
        if (typeof field === "number") {
            return descriptors[field];
        } else {
            return descriptors.find((descriptor) => descriptor.alias === field)!;
        }
    }

    private _checkClosed(): void {
        if (!this._handler) {
            throw new Error("ResultSet is closed");
        }
    }

    private _throwIfBlob(field: number | string): void {
        if (this._getValue(field) instanceof FirebirdBlobLink) {
            throw new Error("Invalid typecasting");
        }
    }

    private async _fetch(options?: { fetchSize?: number }): Promise<any[][] | undefined> {
        this._checkClosed();

        if (this._status === Status.FINISHED) {
            return [];
        }

        const fetchRet = await this.parent.parent.parent.context.statusAction(async (status) => {
            const rows = [];
            const buffers = [
                this.parent.source!.outBuffer!,
                new Uint8Array(this.parent.source!.outMetadata!.getMessageLengthSync(status))
            ];
            let buffer = 0;
            let nextFetch = this._handler!.fetchNextAsync(status, buffers[buffer]);

            while (true) {
                if (await nextFetch === fb.Status.RESULT_OK) {
                    const buffer1 = buffer;
                    buffer = ++buffer % 2;

                    const finish = options && options.fetchSize && rows.length + 1 >= options.fetchSize;

                    if (!finish) {
                        nextFetch = this._handler!.fetchNextAsync(status, buffers[buffer]);
                    }

                    rows.push(await this.parent.source!.dataReader!(this.parent, buffers[buffer1]));

                    if (finish) {
                        return {finished: false, rows};
                    }
                } else {
                    return {finished: true, rows};
                }
            }
        });

        if (fetchRet.finished) {
            this._status = Status.FINISHED;
            return;
        }

        return fetchRet.rows;
    }
}
