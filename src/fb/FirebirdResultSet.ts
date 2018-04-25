import {ResultSet as ApiResultSet, Status} from "node-firebird-native-api";
import {AResultSet} from "../AResultSet";
import {FirebirdBlob} from "./FirebirdBlob";
import {FirebirdBlobLink} from "./FirebirdBlobLink";
import {FirebirdStatement} from "./FirebirdStatement";
import {bufferToValue, dataWrite, IDescriptor, SQL_BLOB_SUB_TYPE} from "./utils/fb-utils";

export interface IResultSetSource {
    handler: ApiResultSet;
    outBuffer: Uint8Array;
}

export class FirebirdResultSet extends AResultSet<FirebirdBlob> {

    public readonly parent: FirebirdStatement;
    public disposeStatementOnClose: boolean = false;
    public source?: IResultSetSource;

    private _buffers: Uint8Array[] = [];
    private _currentIndex: number = AResultSet.NO_INDEX;
    private _finished = false;

    protected constructor(parent: FirebirdStatement, source: IResultSetSource) {
        super();
        this.parent = parent;
        this.source = source;
        this.parent.resultSets.add(this);
    }

    get position(): number {
        this._checkClosed();

        return this._currentIndex;
    }

    public static async open(parent: FirebirdStatement, params: any[]): Promise<FirebirdResultSet> {
        const source: IResultSetSource = await parent.parent.parent.context.statusAction(async (status) => {
            const inBuffer = new Uint8Array(parent.source!.inMetadata.getMessageLengthSync(status));
            const outBuffer = new Uint8Array(parent.source!.outMetadata.getMessageLengthSync(status));

            await dataWrite(parent, parent.source!.inDescriptors, inBuffer, params);

            const handler = await parent.source!.handler.openCursorAsync(status, parent.parent.handler,
                parent.source!.inMetadata, inBuffer, parent.source!.outMetadata, 0);

            return {
                handler: handler!,
                outBuffer
            };
        });
        return new FirebirdResultSet(parent, source);
    }

    private static _throwIfBlob(value: any): void {
        if (value instanceof FirebirdBlobLink) {
            throw new Error("Invalid typecasting");
        }
    }

    public async next(): Promise<boolean> {
        this._checkClosed();

        if (this._currentIndex < this._buffers.length) {
            this._currentIndex++;
            if (this._currentIndex === this._buffers.length) {
                if (!this._finished) {
                    return await this.parent.parent.parent.context.statusAction(async (status) => {
                        const result = await this.source!.handler.fetchNextAsync(status, this.source!.outBuffer);
                        if (result === Status.RESULT_OK) {
                            this._buffers.push(this.source!.outBuffer);
                            return true;
                        }
                        this._finished = true;
                        return false;
                    });
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

        if (!this._finished) {
            const index = this._currentIndex;
            await this.next();
            await this.to(index);
        }

        if (this._buffers.length) {
            await this.to(AResultSet.NO_INDEX);
        }
    }

    public async afterLast(): Promise<void> {
        this._checkClosed();

        if (!this._finished) {
            const index = this._currentIndex;
            await this.last();
            await this.to(index);
        }

        if (this._buffers.length) {
            await this.to(this._buffers.length);
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

        if (this._buffers.length) {
            return await this.to(this._buffers.length - 1);
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

        if (this._finished) {
            return !!this._buffers.length && this._currentIndex === this._buffers.length;
        }

        return false;
    }

    public async isFirst(): Promise<boolean> {
        this._checkClosed();

        return !!this._buffers.length && this._currentIndex === 0;
    }

    public async isLast(): Promise<boolean> {
        this._checkClosed();

        if (this._currentIndex === AResultSet.NO_INDEX) {
            return false;
        }

        if (!this._finished) {
            await this.next();
            await this.previous();
        }

        return this._currentIndex === this._buffers.length - 1;
    }

    public async isClosed(): Promise<boolean> {
        return !this.source;
    }

    public async close(): Promise<void> {
        this._checkClosed();

        await this.parent.parent.parent.context.statusAction((status) => this.source!.handler.closeAsync(status));
        this.source = undefined;
        this._buffers = [];
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
        const value = this._getValue(field);
        FirebirdResultSet._throwIfBlob(value);

        if (value === null || value === undefined) {
            return false;
        }
        return Boolean(this._getValue(field));
    }

    public getDate(i: number): null | Date;
    public getDate(name: string): null | Date;
    public getDate(field: any): null | Date {
        const value = this._getValue(field);
        FirebirdResultSet._throwIfBlob(value);

        if (value === null || value === undefined) {
            return null;
        }
        if (value instanceof Date) {
            return value;
        }
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }

    public getNumber(i: number): number;
    public getNumber(name: string): number;
    public getNumber(field: any): number {
        const value = this._getValue(field);
        FirebirdResultSet._throwIfBlob(value);

        if (value === null || value === undefined) {
            return 0;
        }
        return Number.parseFloat(this._getValue(field));
    }

    public getString(i: number): string;
    public getString(name: string): string;
    public getString(field: any): string {
        const value = this._getValue(field);
        FirebirdResultSet._throwIfBlob(value);

        if (value === null || value === undefined) {
            return "";
        }
        return String(this._getValue(field));
    }

    public async getAny(i: number): Promise<any>;
    public async getAny(name: string): Promise<any>;
    public async getAny(field: any): Promise<any> {
        const value = this._getValue(field);
        if (value instanceof FirebirdBlobLink) {
            const descriptor = this.getOutDescriptor(field);
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

        const descriptor = this.getOutDescriptor(field);
        return bufferToValue(this.parent, descriptor, this._buffers[this._currentIndex]);
    }

    private getOutDescriptor(field: number | string): IDescriptor {
        this._checkClosed();

        const outDescriptors = this.parent.source!.outDescriptors;
        if (typeof field === "number") {
            if (field >= outDescriptors.length) {
                throw new Error("Index not found");
            }
            return outDescriptors[field];
        } else {
            const outDescriptor = outDescriptors.find((item) => item.alias === field);
            if (!outDescriptor) {
                throw new Error("Name not found");
            }
            return outDescriptor;
        }
    }

    private _checkClosed(): void {
        if (!this.source) {
            throw new Error("ResultSet is closed");
        }
    }
}
