import {Attachment as NativeConnection} from "node-firebird-native-api";
import {AConnection, IConnectionOptions} from "../AConnection";
import {AResultSet, CursorType} from "../AResultSet";
import {AStatement, INamedParams} from "../AStatement";
import {ATransaction, ITransactionOptions} from "../ATransaction";
import {Client} from "./Client";
import {Statement} from "./Statement";
import {Transaction} from "./Transaction";
import {createDpb} from "./utils/fb-utils";

export type FirebirdOptions = IConnectionOptions;

export class Connection extends AConnection {

    public client = new Client();
    public transactions = new Set<Transaction>();
    public handler?: NativeConnection;

    get connected(): boolean {
        if (this.handler) {
            this.client.statusActionSync((status) => this.handler!.pingSync(status));
            return true;
        }
        return false;
    }

    private static _optionsToUri(options: FirebirdOptions): string {
        let url = "";
        if (options.host) {
            url += options.host;
        }
        if (options.port) {
            url += `/${options.port}`;
        }
        if (url) {
            url += ":";
        }
        url += options.path;
        return url;
    }

    public async createDatabase(options: FirebirdOptions): Promise<void> {
        if (this.handler) {
            throw new Error("Database already connected");
        }

        await this.client.create();
        this.handler = await this.client.statusAction(async (status) => {
            const dpb = createDpb(options);
            return await this.client!.client!.dispatcher!.createDatabaseAsync(status,
                Connection._optionsToUri(options), dpb.length, dpb);
        });
    }

    public async dropDatabase(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need database connection");
        }

        await this._closeChildren();

        await this.client.statusAction((status) => this.handler!.dropDatabaseAsync(status));
        this.handler = undefined;
        await this.client.destroy();
    }

    public async connect(options: FirebirdOptions): Promise<void> {
        if (this.handler) {
            throw new Error("Database already connected");
        }

        await this.client.create();
        this.handler = await this.client.statusAction(async (status) => {
            const dpb = createDpb(options);
            return await this.client!.client!.dispatcher!.attachDatabaseAsync(status,
                Connection._optionsToUri(options), dpb.length, dpb);
        });
    }

    public async startTransaction(options?: ITransactionOptions): Promise<ATransaction> {
        if (!this.handler) {
            throw new Error("Need database connection");
        }

        return await Transaction.create(this, options);
    }

    public async disconnect(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need database connection");
        }

        await this._closeChildren();

        await this.client.statusAction((status) => this.handler!.detachAsync(status));
        await this.client.destroy();
        this.handler = undefined;
    }

    public async execute(transaction: Transaction, sql: string, params?: any[] | INamedParams): Promise<void> {
        const statement = await Statement.prepare(transaction, sql);
        await statement.execute(params);
        await statement.dispose();
    }

    public async executeQuery(transaction: Transaction,
                              sql: string,
                              params?: any[] | INamedParams,
                              type?: CursorType): Promise<AResultSet> {
        if (transaction.finished) {
            throw new Error("Need to open transaction");
        }

        const statement = await Statement.prepare(transaction, sql);
        const resultSet = await statement.executeQuery(params, type);
        resultSet.disposeStatementOnClose = true;
        return resultSet;
    }

    public async prepare(transaction: Transaction, sql: string): Promise<AStatement> {
        if (transaction.finished) {
            throw new Error("Need to open transaction");
        }

        return await Statement.prepare(transaction, sql);
    }

    private async _closeChildren(): Promise<void> {
        if (this.transactions.size) {
            console.warn("Not all transactions finished, they will be rollbacked");
        }
        await Promise.all(Array.from(this.transactions).reduceRight((promises, transaction) => {
            promises.push(transaction.rollback());
            return promises;
        }, [] as Array<Promise<void>>));
    }
}
