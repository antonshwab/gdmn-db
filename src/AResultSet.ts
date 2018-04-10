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

    /**
     * Retrieves the value of the designated column in the
     * current row of this ResultSet object as a buffer
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {Promise<Buffer | null>}
     * Node Buffer; if the value is SQL NULL, the value returned is null
     */
    public abstract async getBlobBuffer(i: number): Promise<null | Buffer>;

    /**
     * Retrieves the value of the designated column in the
     * current row of this ResultSet object as a buffer
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {Promise<Buffer | null>}
     * Node Buffer; if the value is SQL NULL, the value returned is null
     */
    public abstract async getBlobBuffer(name: string): Promise<null | Buffer>;

    public abstract async getBlobBuffer(field: number | string): Promise<null | Buffer>;

    /**
     * Retrieves the value of the designated column in the
     * current row of this ResultSet object as a stream
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {Promise<NodeJS.ReadableStream | null>}
     * Node Stream; if the value is SQL NULL, the value returned is null
     */
    public abstract async getBlobStream(i: number): Promise<null | NodeJS.ReadableStream>;
    /**
     * Retrieves the value of the designated column in the
     * current row of this ResultSet object as a stream
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {Promise<NodeJS.ReadableStream | null>}
     * Node Stream; if the value is SQL NULL, the value returned is null
     */
    public abstract async getBlobStream(name: string): Promise<null | NodeJS.ReadableStream>;

    public abstract async getBlobStream(field: number | string): Promise<null | NodeJS.ReadableStream>;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a string
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {string | null}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    public abstract getString(i: number): null | string;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a string
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {string | null}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    public abstract getString(name: string): null | string;

    public abstract getString(field: number | string): null | string;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a number
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {number | null}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    public abstract getNumber(i: number): null | number;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a number
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {number | null}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    public abstract getNumber(name: string): null | number;

    public abstract getNumber(field: number | string): null | number;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a boolean
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {boolean | null}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    public abstract getBoolean(i: number): null | boolean;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a boolean
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {boolean | null}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    public abstract getBoolean(name: string): null | boolean;

    public abstract getBoolean(field: number | string): null | boolean;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a Date object
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {Date | null}
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
     * @returns {Date | null}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    public abstract getDate(name: string): null | Date;

    public abstract getDate(field: number | string): null | Date;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a any type
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {any}
     * the column value
     */
    public abstract getAny(i: number): any;

    /**
     * Retrieves the value of the designated column in the current
     * row of this ResultSet object as a any type
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {any}
     * the column value
     */
    public abstract getAny(name: string): any;

    public abstract getAny(field: number | string): any;

    /**
     * Retrieves the current row as IRow object
     *
     * @returns {IRow}
     * the row as object
     */
    public abstract getObject(): IRow;

    /**
     * Retrieves the current row as array
     *
     * @returns {any[]}
     * the row as array
     */
    public abstract getArray(): any[];

    /**
     * Retrieves the all row as array of IRow objects
     *
     * @returns {Promise<IRow[]>}
     * array of IRow objects
     */
    public abstract async getObjects(): Promise<IRow[]>;

    /**
     * Retrieves the all row as array
     *
     * @returns {Promise<any[][]>}
     * array of array columns
     */
    public abstract async getArrays(): Promise<any[][]>;
}
