/// <reference types="node" />
export declare abstract class ABlob {
    /**
     * Retrieves the blob value as a string
     *
     * @returns {Promise<null | Buffer>}
     * the column value; if the blob value is SQL NULL, the value returned is null
     */
    abstract getBuffer(): Promise<null | Buffer>;
    /**
     * Retrieves the blob value as a stream
     *
     * @returns {Promise<null | NodeJS.ReadableStream>}
     * the column value; if the blob value is SQL NULL, the value returned is null
     */
    abstract getStream(): Promise<null | NodeJS.ReadableStream>;
    /**
     * Retrieves the blob value as a string
     *
     * @returns {string}
     * the column value; if the blob value is SQL NULL, the value returned is empty string
     */
    abstract getString(): Promise<string>;
}
