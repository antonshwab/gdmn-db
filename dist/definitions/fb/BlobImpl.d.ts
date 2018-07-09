/// <reference types="node" />
import { ABlob, SequentiallyCallback } from "../ABlob";
import { Transaction } from "./Transaction";
export declare class BlobImpl extends ABlob {
    readonly blobLink: any;
    constructor(transaction: Transaction, value: any);
    readonly transaction: Transaction;
    sequentially(callback: SequentiallyCallback): Promise<void>;
    asBuffer(): Promise<null | Buffer>;
    asString(): Promise<string>;
}
