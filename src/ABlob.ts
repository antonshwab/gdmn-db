export abstract class ABlob {

    /**
     * Retrieves the blob value as a string
     *
     * @returns {Promise<null | Buffer>}
     * the column value; if the blob value is SQL NULL, the value returned is null
     */
    public abstract async asBuffer(): Promise<null | Buffer>;

    /**
     * Retrieves the blob value as a stream
     *
     * @returns {Promise<null | NodeJS.ReadableStream>}
     * the column value; if the blob value is SQL NULL, the value returned is null
     */
    public abstract async asStream(): Promise<null | NodeJS.ReadableStream>;

    /**
     * Retrieves the blob value as a string
     *
     * @returns {string}
     * the column value; if the blob value is SQL NULL, the value returned is empty string
     */
    public abstract async asString(): Promise<string>;
}
