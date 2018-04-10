/// <reference types="node" />
import { TExecutor } from "./types";
export interface IRow {
    [fieldName: string]: any;
}
export declare type TResultSet = AResultSet;
export declare abstract class AResultSet {
    static NO_INDEX: number;
    /**
     * Current row index
     *
     * @returns {number}
     */
    readonly abstract position: number;
    static executeFromParent<R>(sourceCallback: TExecutor<null, TResultSet>, resultCallback: TExecutor<TResultSet, R>): Promise<R>;
    /**
     * Moves the cursor froward one row from its current position.
     * A ResultSet cursor is initially positioned before the first
     * row; the first call to the method next makes the first row
     * the current row; the second call makes the second row the
     * current row, and so on.
     * When a call to the next method returns false, the cursor is
     * positioned after the last row.
     *
     * @returns {Promise<boolean>}
     * true if the new current row is valid;
     * false if there are no more rows
     */
    abstract next(): Promise<boolean>;
    /**
     * Moves the cursor to the previous row in this ResultSet object.
     * When a call to the previous method returns false, the cursor is
     * positioned before the first row.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is now positioned on a valid row;
     * false if the cursor is positioned before the first row
     */
    abstract previous(): Promise<boolean>;
    /**
     * Moves the cursor to the given row number in this ResultSet object.
     * If the row number is positive, the cursor moves to the given row
     * number with respect to the beginning of the result set. The first
     * row is row 0, the second is row 1, and so on
     *
     * @param {number} i
     * the number of the row to which the cursor should move.
     * A value of -1 indicates that the cursor will be positioned before the first row;
     * a positive number indicates the row index;
     * other a negative number ignoring
     * @returns {Promise<boolean>}
     * true if the cursor is moved to a position in this ResultSet object;
     * false if the cursor is before the first row or after the last row
     */
    abstract to(i: number): Promise<boolean>;
    /**
     * Moves the cursor to the front of this ResultSet object,
     * just before the first row. This method has no effect if
     * the result set contains no rows.
     *
     * @returns {Promise<void>}
     */
    abstract beforeFirst(): Promise<void>;
    /**
     * Moves the cursor to the end of this ResultSet object, just
     * after the last row. This method has no effect if the result
     * set contains no rows.
     *
     * @returns {Promise<void>}
     */
    abstract afterLast(): Promise<void>;
    /**
     * Moves the cursor to the first row in this ResultSet object.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is on a valid row;
     * false if there are no rows in the result set
     */
    abstract first(): Promise<boolean>;
    /**
     * Moves the cursor to the last row in this ResultSet object.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is on a valid row;
     * false if there are no rows in the result set
     */
    abstract last(): Promise<boolean>;
    /**
     * Retrieves whether the cursor is before the first row in
     * this ResultSet object.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is before the first row;
     * false if the cursor is at any other position or the result set contains no rows
     */
    abstract isBeforeFirst(): Promise<boolean>;
    /**
     * Retrieves whether the cursor is after the last row in this
     * ResultSet object.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is after the last row;
     * false if the cursor is at any other position or the result set contains no rows
     */
    abstract isAfterLast(): Promise<boolean>;
    /**
     * Retrieves whether the cursor is on the first row of this
     * ResultSet object.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is on the first row;
     * false otherwise
     */
    abstract isFirst(): Promise<boolean>;
    /**
     * Retrieves whether the cursor is on the last row of this
     * ResultSet object. Note: Calling the method isLast may be
     * expensive because the driver might need to fetch
     * ahead one row in order to determine whether the current
     * row is the last row in the result set.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is on the last row;
     * false otherwise
     */
    abstract isLast(): Promise<boolean>;
    /**
     * Retrieves whether this ResultSet object has been closed.
     * A ResultSet is closed if the method close has been called
     * on it.
     *
     * @returns {Promise<boolean>}
     * true if this ResultSet object is closed;
     * false if it is still open
     */
    abstract isClosed(): Promise<boolean>;
    /**
     * Releases this ResultSet object's database and resources.
     *
     * @returns {Promise<void>}
     */
    abstract close(): Promise<void>;
    abstract getBlobBuffer(i: number): Promise<null | Buffer>;
    abstract getBlobBuffer(name: string): Promise<null | Buffer>;
    abstract getBlobBuffer(field: number | string): Promise<null | Buffer>;
    abstract getBlobStream(i: number): Promise<null | NodeJS.ReadableStream>;
    abstract getBlobStream(name: string): Promise<null | NodeJS.ReadableStream>;
    abstract getBlobStream(field: number | string): Promise<null | NodeJS.ReadableStream>;
    abstract getString(i: number): null | string;
    abstract getString(name: string): null | string;
    abstract getString(field: number | string): null | string;
    abstract getNumber(i: number): null | number;
    abstract getNumber(name: string): null | number;
    abstract getNumber(field: number | string): null | number;
    abstract getBoolean(i: number): null | boolean;
    abstract getBoolean(name: string): null | boolean;
    abstract getBoolean(field: number | string): null | boolean;
    abstract getDate(i: number): null | Date;
    abstract getDate(name: string): null | Date;
    abstract getDate(field: number | string): null | Date;
    abstract getAny(i: number): any;
    abstract getAny(name: string): any;
    abstract getAny(field: number | string): any;
    abstract getObject(): IRow;
    abstract getArray(): any[];
    abstract getObjects(): Promise<IRow[]>;
    abstract getArrays(): Promise<any[][]>;
}
