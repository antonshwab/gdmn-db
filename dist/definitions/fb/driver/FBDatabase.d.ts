/// <reference types="node" />
import fb from "node-firebird";
export declare type BlobField = (callback: (err: Error, name: string, event: IBlobEventEmitter) => void) => void;
export declare type DBOptions = fb.Options;
export interface IBlobEventEmitter extends NodeJS.EventEmitter {
    pipe(destination: NodeJS.WritableStream): void;
}
export declare type Executor<Subject, Result> = ((subject: Subject) => Result) | ((subject: Subject) => Promise<Result>);
export declare enum IsolationTypes {
    ISOLATION_READ_COMMITED_READ_ONLY = 0,
    ISOLATION_SERIALIZABLE = 1,
    ISOLATION_REPEATABLE_READ = 2,
    ISOLATION_READ_COMMITED = 3,
    ISOLATION_READ_UNCOMMITTED = 4,
}
export declare abstract class FBase<Source extends (fb.Database | fb.Transaction)> {
    protected _source: Source;
    protected constructor(source: Source);
    static blobToStream(blob: BlobField): Promise<IBlobEventEmitter>;
    static blobToBuffer(blob: BlobField): Promise<Buffer>;
    query(query: string, params?: any[]): Promise<any[]>;
    execute(query: string, params?: any[]): Promise<any[]>;
    sequentially(query: string, params: any[], rowCallback: fb.SequentialCallback): Promise<void>;
}
export declare class FBTransaction extends FBase<fb.Transaction> {
    isInTransaction(): boolean;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
export default class FBDatabase extends FBase<fb.Database> {
    constructor();
    constructor(source: fb.Database);
    static executeDatabase<T>(options: DBOptions, callback: Executor<FBDatabase, T>): Promise<T>;
    static executeDatabase<T>(pool: FBConnectionPool, callback: Executor<FBDatabase, T>): Promise<T>;
    static executeTransaction<T>(options: DBOptions, callback: Executor<FBTransaction, T>, isolation?: IsolationTypes): Promise<T>;
    static executeTransaction<T>(pool: FBConnectionPool, callback: Executor<FBTransaction, T>, isolation?: IsolationTypes): Promise<T>;
    static escape(value: any): string;
    isAttached(): boolean;
    create(options: DBOptions): Promise<void>;
    attachOrCreate(options: DBOptions): Promise<void>;
    attach(options: DBOptions): Promise<void>;
    detach(): Promise<void>;
    transaction(isolation?: IsolationTypes): Promise<FBTransaction>;
    executeTransaction<T>(callback: Executor<FBTransaction, T>, isolation?: IsolationTypes): Promise<T>;
}
export declare class FBConnectionPool {
    static DEFAULT_MAX_POOL: number;
    protected _connectionPool: fb.ConnectionPool;
    isConnectionPoolCreated(): boolean;
    createConnectionPool(options: DBOptions, max?: number): void;
    destroyConnectionPool(): void;
    attach(): Promise<FBDatabase>;
}
