import {ABlob} from "./ABlob";
import {AResultSetMetadata} from "./AResultSetMetadata";
import {AStatement} from "./AStatement";
import {TExecutor} from "./types";

export enum CursorType {
    FORWARD_ONLY,
    SCROLLABLE
}

export abstract class AResultSet {

    public static DEFAULT_TYPE = CursorType.FORWARD_ONLY;

    protected readonly _statement: AStatement;
    protected readonly _type: CursorType;

    protected constructor(statement: AStatement, type: CursorType = AResultSet.DEFAULT_TYPE) {
        this._statement = statement;
        this._type = type;
    }

    get statement(): AStatement {
        return this._statement;
    }

    get type(): CursorType {
        return this._type;
    }

    /**
     * Retrieves whether this ResultSet object has been closed.
     * A ResultSet is closed if the method close has been called
     * on it.
     *
     * @returns {boolean}
     * true if this ResultSet object is closed;
     * false if it is still open
     */
    abstract get closed(): boolean;

    abstract get metadata(): AResultSetMetadata;

    public static async executeSelf<R>(selfReceiver: TExecutor<null, AResultSet>,
                                       callback: TExecutor<AResultSet, R>): Promise<R> {
        let self: undefined | AResultSet;
        try {
            self = await selfReceiver(null);
            return await callback(self);
        } finally {
            if (self) {
                await self.close();
            }
        }
    }

    public abstract async next(): Promise<boolean>;

    public abstract async previous(): Promise<boolean>;

    public abstract async absolute(i: number): Promise<boolean>;

    public abstract async relative(i: number): Promise<boolean>;

    public abstract async first(): Promise<boolean>;

    public abstract async last(): Promise<boolean>;

    public abstract async isBof(): Promise<boolean>;

    public abstract async isEof(): Promise<boolean>;

    /** Releases this ResultSet object's database and resources. */
    public abstract async close(): Promise<void>;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a Blob object
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {B}
     * the blob object for column value
     */
    public abstract getBlob(i: number): ABlob;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a Blob object
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {B}
     * the blob object for column value
     */
    public abstract getBlob(name: string): ABlob;

    public abstract getBlob(field: any): ABlob;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a string
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {string}
     * the column value; if the value is SQL NULL, the value returned is empty string
     */
    public abstract getString(i: number): string;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a string
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {string}
     * the column value; if the value is SQL NULL, the value returned is empty string
     */
    public abstract getString(name: string): string;

    public abstract getString(field: any): string;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a number
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {number}
     * the column value; if the value is SQL NULL, the value returned is 0
     */
    public abstract getNumber(i: number): number;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a number
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {number}
     * the column value; if the value is SQL NULL, the value returned is 0
     */
    public abstract getNumber(name: string): number;

    public abstract getNumber(field: any): number;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a boolean
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {boolean}
     * the column value; if the value is SQL NULL, the value returned is false
     */
    public abstract getBoolean(i: number): boolean;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a boolean
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {boolean}
     * the column value; if the value is SQL NULL, the value returned is false
     */
    public abstract getBoolean(name: string): boolean;

    public abstract getBoolean(field: any): boolean;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a Date object
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {null | Date}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    public abstract getDate(i: number): null | Date;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a Date object
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {null | Date}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    public abstract getDate(name: string): null | Date;

    public abstract getDate(field: any): null | Date;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a any type
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {Promise<any>}
     * the column value
     */
    public abstract async getAny(i: number): Promise<any>;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a any type
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {Promise<any>}
     * the column value
     */
    public abstract async getAny(name: string): Promise<any>;

    public abstract async getAny(field: any): Promise<any>;

    /**
     * Testing a column for null value.
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {boolean}
     * true, if value is null;
     * false, if value is not null
     */
    public abstract isNull(i: number): boolean;

    /**
     * Testing a column for null value.
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {boolean}
     * true, if value is null;
     * false, if value is not null
     */
    public abstract isNull(name: string): boolean;

    public abstract isNull(field: any): boolean;
}
