/// <reference types="node" />
import { AResultSet } from "./AResultSet";
export declare type SequentiallyCallback = ((buffer: Buffer) => Promise<void>) | ((buffer: Buffer) => void);
export declare abstract class ABlob {
    private readonly _resultSet;
    protected constructor(resultSet: AResultSet);
    readonly resultSet: AResultSet;
    /**
     * Retrieves the blob value as a sequentially buffers
     *
     * @param {SequentiallyCallback} callback
     * @returns {Promise<void>}
     */
    abstract sequentially(callback: SequentiallyCallback): Promise<void>;
    /**
     * Retrieves the blob value as a string
     *
     * @returns {Promise<null | Buffer>}
     * the column value; if the blob value is SQL NULL, the value returned is null
     */
    abstract asBuffer(): Promise<null | Buffer>;
    /**
     * Retrieves the blob value as a string
     *
     * @returns {string}
     * the column value; if the blob value is SQL NULL, the value returned is empty string
     */
    abstract asString(): Promise<string>;
}
