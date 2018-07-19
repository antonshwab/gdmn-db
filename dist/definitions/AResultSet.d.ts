import { AResult } from "./AResult";
import { AStatement } from "./AStatement";
import { TExecutor } from "./types";
export declare enum CursorType {
    FORWARD_ONLY = 0,
    SCROLLABLE = 1
}
export declare abstract class AResultSet extends AResult {
    static DEFAULT_TYPE: CursorType;
    protected readonly _type: CursorType;
    protected constructor(statement: AStatement, type?: CursorType);
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
    abstract readonly closed: boolean;
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
}
