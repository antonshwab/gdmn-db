import { ABlob } from "./ABlob";
import { AResultSetMetadata } from "./AResultSetMetadata";
import { AStatement } from "./AStatement";
import { TExecutor } from "./types";
export declare enum CursorType {
    FORWARD_ONLY = 0,
    SCROLLABLE = 1,
}
export declare abstract class AResultSet {
    static DEFAULT_TYPE: CursorType;
    protected readonly _statement: AStatement;
    protected readonly _type: CursorType;
    protected constructor(statement: AStatement, type?: CursorType);
    readonly statement: AStatement;
    readonly type: CursorType;
    /**
     * Retrieves whether this ResultSet object has been closed.
     * A ResultSet is closed if the method close has been called
     * on it.
     *
     * @returns {boolean}
     * true if this ResultSet object is closed;
     * false if it is still open
     */
    readonly abstract closed: boolean;
    readonly abstract metadata: AResultSetMetadata;
    static executeSelf<R>(selfReceiver: TExecutor<null, AResultSet>, callback: TExecutor<AResultSet, R>): Promise<R>;
    abstract next(): Promise<boolean>;
    abstract previous(): Promise<boolean>;
    abstract absolute(i: number): Promise<boolean>;
    abstract relative(i: number): Promise<boolean>;
    abstract first(): Promise<boolean>;
    abstract last(): Promise<boolean>;
    abstract isBof(): Promise<boolean>;
    abstract isEof(): Promise<boolean>;
    /** Releases this ResultSet object's database and resources. */
    abstract close(): Promise<void>;
    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a Blob object
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {B}
     * the blob object for column value
     */
    abstract getBlob(i: number): ABlob;
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
    abstract getBlob(name: string): ABlob;
    abstract getBlob(field: any): ABlob;
    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a string
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {string}
     * the column value; if the value is SQL NULL, the value returned is empty string
     */
    abstract getString(i: number): string;
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
    abstract getString(name: string): string;
    abstract getString(field: any): string;
    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a number
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {number}
     * the column value; if the value is SQL NULL, the value returned is 0
     */
    abstract getNumber(i: number): number;
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
    abstract getNumber(name: string): number;
    abstract getNumber(field: any): number;
    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a boolean
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {boolean}
     * the column value; if the value is SQL NULL, the value returned is false
     */
    abstract getBoolean(i: number): boolean;
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
    abstract getBoolean(name: string): boolean;
    abstract getBoolean(field: any): boolean;
    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a Date object
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {null | Date}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    abstract getDate(i: number): null | Date;
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
    abstract getDate(name: string): null | Date;
    abstract getDate(field: any): null | Date;
    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a any type
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {Promise<any>}
     * the column value
     */
    abstract getAny(i: number): Promise<any>;
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
    abstract getAny(name: string): Promise<any>;
    abstract getAny(field: any): Promise<any>;
    /**
     * Testing a column for null value.
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {boolean}
     * true, if value is null;
     * false, if value is not null
     */
    abstract isNull(i: number): boolean;
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
    abstract isNull(name: string): boolean;
    abstract isNull(field: any): boolean;
}
