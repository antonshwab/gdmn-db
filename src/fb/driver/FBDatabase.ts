import fb from "node-firebird";

export type BlobField = (callback: (err: Error, name: string, event: IBlobEventEmitter) => void) => void;

export type DBOptions = fb.Options;

export interface IBlobEventEmitter extends NodeJS.EventEmitter {
    pipe(destination: NodeJS.WritableStream): void;
}

export type Executor<Subject, Result> = ((subject: Subject) => Result) | ((subject: Subject) => Promise<Result>);

export enum IsolationTypes {
    ISOLATION_READ_COMMITED_READ_ONLY,
    ISOLATION_SERIALIZABLE,
    ISOLATION_REPEATABLE_READ,
    ISOLATION_READ_COMMITED,
    ISOLATION_READ_UNCOMMITTED
}

export abstract class FBase<Source extends (fb.Database | fb.Transaction)> {

    protected _source: null | Source;

    protected constructor(source: null | Source) {
        this._source = source;
    }

    public static async blobToStream(blob: BlobField): Promise<IBlobEventEmitter> {
        return new Promise<any>((resolve, reject) => {
            blob((err, name, event) => {
                if (err) return reject(err);
                resolve(event);
            });
        });
    }

    public static async blobToBuffer(blob: BlobField): Promise<Buffer> {
        const blobStream = await FBase.blobToStream(blob);

        return new Promise<Buffer>((resolve, reject) => {
            let chunks: Buffer[] = [], length = 0;
            blobStream.on("data", (chunk: Buffer) => {
                chunks.push(chunk);
                length += chunk.length;
            });
            blobStream.on("end", () => {
                return resolve(Buffer.concat(chunks, length));
            });
        });
    }

    public async query(query: string, params?: any[]): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            if (!this._source) throw new Error("Database need created");
            this._source.query(query, params || [], (err, result) => {
                err ? reject(err) : resolve(result);
            });
        });
    }

    public async execute(query: string, params?: any[]): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            if (!this._source) throw new Error("Database need created");
            this._source.execute(query, params || [], (err, result) => {
                err ? reject(err) : resolve(result);
            });
        });
    }

    public async sequentially(query: string, params: any[] = [], rowCallback: fb.SequentialCallback): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this._source) throw new Error("Database need created");
            this._source.sequentially(query, params, rowCallback, (err) => {
                err ? reject(err) : resolve();
            });
        });
    }
}

export class FBTransaction extends FBase<fb.Transaction> {

    public isInTransaction(): boolean {
        return Boolean(this._source);
    }

    public async commit(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this._source) throw new Error("Transaction need created");
            this._source.commit((err) => {
                if (err) return reject(err);
                this._source = null;
                resolve();
            });
        });
    }

    public async rollback(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this._source) throw new Error("Transaction need created");
            this._source.rollback((err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}

export default class FBDatabase extends FBase<fb.Database> {

    constructor(source: null | fb.Database = null) {
        super(source);
    }

    public static async executeDatabase<T>(options: DBOptions, callback: Executor<FBDatabase, T>): Promise<T>;
    public static async executeDatabase<T>(pool: FBConnectionPool, callback: Executor<FBDatabase, T>): Promise<T>;
    public static async executeDatabase<T>(source: any, callback: Executor<FBDatabase, T>): Promise<T> {
        let database: undefined | FBDatabase;
        try {
            if (source instanceof FBConnectionPool) {
                database = await source.attach();
            } else {
                database = new FBDatabase();
                await database.attach(source);
            }
            return await callback(database);
        } finally {
            if (database && database.isAttached()) {
                try {
                    await database.detach();
                } catch (error) {
                    console.warn(error);
                }
            }
        }
    }

    public static async executeTransaction<T>(options: DBOptions, callback: Executor<FBTransaction, T>, isolation?: IsolationTypes): Promise<T>;
    public static async executeTransaction<T>(pool: FBConnectionPool, callback: Executor<FBTransaction, T>, isolation?: IsolationTypes): Promise<T>;
    public static async executeTransaction<T>(source: any, callback: Executor<FBTransaction, T>, isolation?: IsolationTypes): Promise<T> {
        return await FBDatabase.executeDatabase<T>(source, async (database: FBDatabase) => {
            return await database.executeTransaction<T>(callback, isolation);
        });
    }

    public static escape(value: any): string {
        return fb.escape(value);
    }

    public isAttached(): boolean {
        return Boolean(this._source);
    }

    public async create(options: DBOptions): Promise<void> {
        if (this._source) throw new Error("Database already created");
        return new Promise<void>(((resolve, reject) => {
            fb.create(options, (err, db) => {
                if (err) return reject(err);
                this._source = db;
                resolve();
            });
        }));
    }

    public async attachOrCreate(options: DBOptions): Promise<void> {
        if (this._source) throw new Error("Database already created");
        return new Promise<void>((resolve, reject) => {
            fb.attachOrCreate(options, (err, db) => {
                if (err) return reject(err);
                this._source = db;
                resolve();
            });
        });
    }

    public async attach(options: DBOptions): Promise<void> {
        if (this._source) throw new Error("Database already created");
        return new Promise<void>((resolve, reject) => {
            fb.attach(options, (err, db) => {
                if (err) return reject(err);
                this._source = db;
                resolve();
            });
        });
    }

    public async detach(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this._source) throw new Error("Database need created");
            this._source.detach((err) => {
                if (err) return reject(err);
                this._source = null;
                resolve();
            });
        });
    }

    public async transaction(isolation?: IsolationTypes): Promise<FBTransaction> {
        return new Promise<FBTransaction>((resolve, reject) => {
            if (!this._source) throw new Error("Database need created");
            this._source.transaction((<any>fb)[IsolationTypes[isolation || -1]], (err, transaction) => {
                err ? reject(err) : resolve(new FBTransaction(transaction));
            });
        });
    }

    public async executeTransaction<T>(callback: Executor<FBTransaction, T>, isolation?: IsolationTypes): Promise<T> {
        let transaction: undefined | FBTransaction;
        try {
            transaction = await this.transaction(isolation);
            const result = await callback(transaction);
            await transaction.commit();
            return result;
        } catch (error) {
            if (transaction && transaction.isInTransaction()) {
                try {
                    await transaction.rollback();
                } catch (error) {
                    console.warn(error);
                }
            }
            throw error;
        }
    }
}

export class FBConnectionPool {

    public static DEFAULT_MAX_POOL = 10;

    protected _connectionPool: null | fb.ConnectionPool = null;

    public isConnectionPoolCreated(): boolean {
        return Boolean(this._connectionPool);
    }

    public createConnectionPool(options: DBOptions, max: number = FBConnectionPool.DEFAULT_MAX_POOL): void {
        if (this._connectionPool) throw new Error("Connection pool already created");
        this._connectionPool = fb.pool(max, options, () => 0);
    }

    public destroyConnectionPool(): void {
        if (!this._connectionPool) throw new Error("Connection pool need created");
        this._connectionPool.destroy();
        this._connectionPool = null;
    }

    public async attach(): Promise<FBDatabase> {
        return new Promise<FBDatabase>((resolve, reject) => {
            if (!this._connectionPool) throw new Error("Connection pool need created");
            this._connectionPool.get((err, db) => {
                if (err) return reject(err);
                resolve(new FBDatabase(db));
            });
        });
    }
}