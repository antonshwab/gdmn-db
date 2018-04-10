import {TExecutor} from "./types";

export interface IRow {
    [fieldName: string]: any;
}

export type TResultSet = AResultSet;

export abstract class AResultSet {

    public static NO_INDEX = -1;

    /**
     * Current row index
     *
     * @returns {number}
     */
    abstract get position(): number;

    public static async executeFromParent<R>(sourceCallback: TExecutor<null, TResultSet>,
                                             resultCallback: TExecutor<TResultSet, R>): Promise<R> {
        let resultSet: undefined | TResultSet;
        try {
            resultSet = await sourceCallback(null);
            return await resultCallback(resultSet);
        } finally {
            if (resultSet) {
                await resultSet.close();
            }
        }
    }

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
    public abstract async next(): Promise<boolean>;

    /**
     * Moves the cursor to the previous row in this ResultSet object.
     * When a call to the previous method returns false, the cursor is
     * positioned before the first row.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is now positioned on a valid row;
     * false if the cursor is positioned before the first row
     */
    public abstract async previous(): Promise<boolean>;

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
    public abstract async to(i: number): Promise<boolean>;

    /**
     * Moves the cursor to the front of this ResultSet object,
     * just before the first row. This method has no effect if
     * the result set contains no rows.
     *
     * @returns {Promise<void>}
     */
    public abstract async beforeFirst(): Promise<void>;

    /**
     * Moves the cursor to the end of this ResultSet object, just
     * after the last row. This method has no effect if the result
     * set contains no rows.
     *
     * @returns {Promise<void>}
     */
    public abstract async afterLast(): Promise<void>;

    /**
     * Moves the cursor to the first row in this ResultSet object.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is on a valid row;
     * false if there are no rows in the result set
     */
    public abstract async first(): Promise<boolean>;

    /**
     * Moves the cursor to the last row in this ResultSet object.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is on a valid row;
     * false if there are no rows in the result set
     */
    public abstract async last(): Promise<boolean>;

    /**
     * Retrieves whether the cursor is before the first row in
     * this ResultSet object.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is before the first row;
     * false if the cursor is at any other position or the result set contains no rows
     */
    public abstract async isBeforeFirst(): Promise<boolean>;

    /**
     * Retrieves whether the cursor is after the last row in this
     * ResultSet object.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is after the last row;
     * false if the cursor is at any other position or the result set contains no rows
     */
    public abstract async isAfterLast(): Promise<boolean>;

    /**
     * Retrieves whether the cursor is on the first row of this
     * ResultSet object.
     *
     * @returns {Promise<boolean>}
     * true if the cursor is on the first row;
     * false otherwise
     */
    public abstract async isFirst(): Promise<boolean>;

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
    public abstract async isLast(): Promise<boolean>;

    /**
     * Retrieves whether this ResultSet object has been closed.
     * A ResultSet is closed if the method close has been called
     * on it.
     *
     * @returns {Promise<boolean>}
     * true if this ResultSet object is closed;
     * false if it is still open
     */
    public abstract async isClosed(): Promise<boolean>;

    /**
     * Releases this ResultSet object's database and resources.
     *
     * @returns {Promise<void>}
     */
    public abstract async close(): Promise<void>;

    public abstract async getBlobBuffer(i: number): Promise<null | Buffer>;
    public abstract async getBlobBuffer(name: string): Promise<null | Buffer>;
    public abstract async getBlobBuffer(field: number | string): Promise<null | Buffer>;

    public abstract async getBlobStream(i: number): Promise<null | NodeJS.ReadableStream>;
    public abstract async getBlobStream(name: string): Promise<null | NodeJS.ReadableStream>;
    public abstract async getBlobStream(field: number | string): Promise<null | NodeJS.ReadableStream>;

    public abstract getString(i: number): null | string;
    public abstract getString(name: string): null | string;
    public abstract getString(field: number | string): null | string;

    public abstract getNumber(i: number): null | number;
    public abstract getNumber(name: string): null | number;
    public abstract getNumber(field: number | string): null | number;

    public abstract getBoolean(i: number): null | boolean;
    public abstract getBoolean(name: string): null | boolean;
    public abstract getBoolean(field: number | string): null | boolean;

    public abstract getDate(i: number): null | Date;
    public abstract getDate(name: string): null | Date;
    public abstract getDate(field: number | string): null | Date;

    public abstract getAny(i: number): any;
    public abstract getAny(name: string): any;
    public abstract getAny(field: number | string): any;

    public abstract getObject(): IRow;

    public abstract getArray(): any[];

    public abstract async getObjects(): Promise<IRow[]>;

    public abstract async getArrays(): Promise<any[][]>;
}
