import * as fb from "node-firebird-native-api";
import {BlobObj} from "./blobObj";
import {BlobStream} from "./blobStream";
import {Client} from "./client";
import {createDpb} from "./fb-utils";
import {ResultSet} from "./resultSet";
import {Statement} from "./statement";
import {Transaction} from "./transaction";
import {ConnectOptions, TransactionOptions} from "./types";

/** Attachment implementation. */
export class Attachment {
    public statements = new Set<Statement>();
    public transactions = new Set<Transaction>();

    public attachmentHandle?: fb.Attachment;

    protected constructor(public client?: Client) {
    }

    public static async connect(client: Client,
                                uri: string,
                                options?: ConnectOptions): Promise<Attachment> {
        const attachment = new Attachment(client);

        return await client.statusAction(async (status) => {
            const dpb = createDpb(options);
            attachment.attachmentHandle = await client!.dispatcher!.attachDatabaseAsync(status, uri, dpb.length, dpb);
            return attachment;
        });
    }

    public static async createDatabase(client: Client,
                                       uri: string,
                                       options?: ConnectOptions): Promise<Attachment> {
        const attachment = new Attachment(client);

        return await client.statusAction(async (status) => {
            const dpb = createDpb(options);
            attachment.attachmentHandle = await client!.dispatcher!.createDatabaseAsync(status, uri, dpb.length, dpb);
            return attachment;
        });
    }

    /** Disconnects this attachment. */
    public async disconnect(): Promise<void> {
        this.check();

        await this.preDispose();
        if (this.client) {
            await this.client.statusAction((status) => this.attachmentHandle!.detachAsync(status));
        }
        this.attachmentHandle = undefined;
        await this.postDispose();
    }

    /** Drops the database and release this attachment. */
    public async dropDatabase(): Promise<void> {
        this.check();

        await this.preDispose();
        if (this.client) {
            await this.client.statusAction((status) => this.attachmentHandle!.dropDatabaseAsync(status));
        }
        this.attachmentHandle = undefined;
        await this.postDispose();
    }

    /** Executes a statement that uses the SET TRANSACTION command. Returns the new transaction. */
    public async executeTransaction(transaction: Transaction, sqlStmt: string): Promise<Transaction> {
        this.check();

        const statement = await this.prepare(transaction, sqlStmt);
        try {
            const newTransaction = await statement.executeTransaction(transaction);
            this.transactions.add(newTransaction);
            return newTransaction;
        }
        finally {
            await statement.dispose();
        }
    }

    /** Executes a statement that has no result set. */
    public async execute(transaction: Transaction, sqlStmt: string, parameters?: any[]): Promise<void> {
        this.check();

        const statement = await this.prepare(transaction, sqlStmt);
        try {
            return await statement.execute(transaction, parameters);
        }
        finally {
            await statement.dispose();
        }
    }

    /** Executes a statement that returns a single record. */
    public async executeReturning(transaction: Transaction, sqlStmt: string, parameters?: any[]): Promise<any[]> {
        this.check();

        const statement = await this.prepare(transaction, sqlStmt);
        try {
            return await statement.executeReturning(transaction, parameters);
        }
        finally {
            await statement.dispose();
        }
    }

    /** Executes a statement that has result set. */
    public async executeQuery(transaction: Transaction, sqlStmt: string, parameters?: any[]): Promise<ResultSet> {
        this.check();

        const statement = await this.prepare(transaction, sqlStmt);
        try {
            const resultSet = await statement.executeQuery(transaction, parameters);
            resultSet.disposeStatementOnClose = true;
            return resultSet;
        }
        catch (e) {
            await statement.dispose();
            throw e;
        }
    }

    public async createBlob(transaction: Transaction): Promise<BlobStream> {
        return await BlobStream.create(this, transaction);
    }

    public async openBlob(transaction: Transaction, blob: BlobObj): Promise<BlobStream> {
        return await BlobStream.open(this, transaction, blob);
    }

    /** Starts a new transaction. */
    public async startTransaction(options?: TransactionOptions): Promise<Transaction> {
        this.check();

        const transaction = await Transaction.start(this, options);
        this.transactions.add(transaction);
        return transaction;
    }

    /** Prepares a query. */
    public async prepare(transaction: Transaction, sqlStmt: string): Promise<Statement> {
        this.check();

        const statement = await Statement.prepare(this, transaction, sqlStmt);
        this.statements.add(statement);
        return statement;
    }

    private check(): void {
        if (!this.client) {
            throw new Error("Attachment is already disconnected.");
        }
    }

    private async preDispose(): Promise<void> {
        try {
            await Promise.all(Array.from(this.statements).map((statement) => statement.dispose()));
            await Promise.all(Array.from(this.transactions).map((transaction) => transaction.rollback()));
        }
        finally {
            this.statements.clear();
            this.transactions.clear();
        }
    }

    private async postDispose(): Promise<void> {
        this.client!.attachments.delete(this);
        this.client = undefined;
    }
}
