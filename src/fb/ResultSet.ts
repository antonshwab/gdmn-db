import {ResultSet as NativeResultSet, Statement as NativeStatement, Status} from "node-firebird-native-api";
import {AResultSet, CursorType} from "../AResultSet";
import {AResultSetMetadata} from "../AResultSetMetadata";
import {BlobImpl} from "./BlobImpl";
import {BlobLink} from "./BlobLink";
import {ResultSetMetadata} from "./ResultSetMetadata";
import {Statement} from "./Statement";
import {bufferToValue, dataWrite, IDescriptor, SQL_BLOB_SUB_TYPE} from "./utils/fb-utils";

export interface IResultSetSource {
    handler: NativeResultSet;
    metadata: ResultSetMetadata;
    outBuffer: Uint8Array;
}

enum ResultStatus {
    ERROR = Status.RESULT_ERROR,
    NO_DATA = Status.RESULT_NO_DATA,
    OK = Status.RESULT_OK,
    SEGMENT = Status.RESULT_SEGMENT
}

export class ResultSet extends AResultSet {

    public disposeStatementOnClose: boolean = false;
    public source?: IResultSetSource;

    protected constructor(statement: Statement, source: IResultSetSource, type?: CursorType) {
        super(statement, type);
        this.source = source;
        this.statement.resultSets.add(this);
    }

    get statement(): Statement {
        return super.statement as Statement;
    }

    get closed(): boolean {
        return !this.source;
    }

    get metadata(): AResultSetMetadata {
        this._checkClosed();

        return this.source!.metadata;
    }

    public static async open(statement: Statement, params: any[], type?: CursorType): Promise<ResultSet> {
        const source: IResultSetSource = await statement.transaction.connection.context.statusAction(async (status) => {
            const metadata = await ResultSetMetadata.getMetadata(statement);
            const inBuffer = new Uint8Array(statement.source!.inMetadata.getMessageLengthSync(status));
            const outBuffer = new Uint8Array(metadata.handler.getMessageLengthSync(status));

            await dataWrite(statement, statement.source!.inDescriptors, inBuffer, params);

            const handler = await statement.source!.handler.openCursorAsync(status, statement.transaction.handler,
                statement.source!.inMetadata, inBuffer, metadata.handler,
                type || AResultSet.DEFAULT_TYPE === CursorType.SCROLLABLE ? NativeStatement.CURSOR_TYPE_SCROLLABLE : 0);
            // TODO IStatement::CURSOR_TYPE_SCROLLABLE optional

            return {
                handler: handler!,
                metadata,
                outBuffer
            };
        });
        return new ResultSet(statement, source, type);
    }

    private static _throwIfBlob(value: any): void {
        if (value instanceof BlobLink) {
            throw new Error("Invalid typecasting");
        }
    }

    public async next(): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchNextAsync(status, this.source!.outBuffer)
        ));
    }

    public async previous(): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchPriorAsync(status, this.source!.outBuffer)
        ));
    }

    public async absolute(i: number): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchAbsoluteAsync(status, i, this.source!.outBuffer)
        ));
    }

    public async relative(i: number): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchRelativeAsync(status, i, this.source!.outBuffer)
        ));
    }

    public async first(): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchFirstAsync(status, this.source!.outBuffer)
        ));
    }

    public async last(): Promise<boolean> {
        this._checkClosed();

        return await this._executeMove((status) => (
            this.source!.handler.fetchLastAsync(status, this.source!.outBuffer)
        ));
    }

    public async close(): Promise<void> {
        this._checkClosed();

        await this.source!.metadata.release();

        await this.statement.transaction.connection.context
            .statusAction((status) => this.source!.handler.closeAsync(status));
        this.source = undefined;
        this.statement.resultSets.delete(this);

        if (this.disposeStatementOnClose) {
            await this.statement.dispose();
        }
    }

    public async isBof(): Promise<boolean> {
        this._checkClosed();

        return await this.statement.transaction.connection.context.statusAction(async (status) => {
            return await this.source!.handler.isBofAsync(status);
        });
    }

    public async isEof(): Promise<boolean> {
        this._checkClosed();

        return await this.statement.transaction.connection.context.statusAction(async (status) => {
            return await this.source!.handler.isEofAsync(status);
        });
    }

    public getBlob(i: number): BlobImpl;
    public getBlob(name: string): BlobImpl;
    public getBlob(field: any): BlobImpl {
        return new BlobImpl(this, this._getValue(field));
    }

    public getBoolean(i: number): boolean;
    public getBoolean(name: string): boolean;
    public getBoolean(field: any): boolean {
        const value = this._getValue(field);
        ResultSet._throwIfBlob(value);

        if (value === null || value === undefined) {
            return false;
        }
        return Boolean(this._getValue(field));
    }

    public getDate(i: number): null | Date;
    public getDate(name: string): null | Date;
    public getDate(field: any): null | Date {
        const value = this._getValue(field);
        ResultSet._throwIfBlob(value);

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
        ResultSet._throwIfBlob(value);

        if (value === null || value === undefined) {
            return 0;
        }
        return Number.parseFloat(this._getValue(field));
    }

    public getString(i: number): string;
    public getString(name: string): string;
    public getString(field: any): string {
        const value = this._getValue(field);
        ResultSet._throwIfBlob(value);

        if (value === null || value === undefined) {
            return "";
        }
        return String(this._getValue(field));
    }

    public async getAny(i: number): Promise<any>;
    public async getAny(name: string): Promise<any>;
    public async getAny(field: any): Promise<any> {
        const value = this._getValue(field);
        if (value instanceof BlobLink) {
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
        return bufferToValue(this.statement, descriptor, this.source!.outBuffer);
    }

    private getOutDescriptor(field: number | string): IDescriptor {
        this._checkClosed();

        const outDescriptors = this.source!.metadata.descriptors;
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

    private async _executeMove(callback: (status: any) => Promise<ResultStatus>): Promise<boolean> {
        let result = ResultStatus.ERROR;
        try {
            result = await this.statement.transaction.connection.context.statusAction(async (status) => {
                return await callback(status);
            });
        } catch (error) {
            throw error;    // TODO replace on own errors
        }
        return result === Status.RESULT_OK;
    }
}
