import {Attachment} from "node-firebird-native-api";
import {AConnection, IConnectionOptions} from "../AConnection";
import {ITransactionOptions} from "../ATransaction";
import {FirebirdBlob} from "./FirebirdBlob";
import {FirebirdContext} from "./FirebirdContext";
import {FirebirdResultSet} from "./FirebirdResultSet";
import {FirebirdStatement} from "./FirebirdStatement";
import {FirebirdTransaction} from "./FirebirdTransaction";
import {createDpb} from "./utils/fb-utils";

export type FirebirdOptions = IConnectionOptions;

export class FirebirdConnection extends AConnection<FirebirdOptions, FirebirdBlob, FirebirdResultSet, FirebirdStatement,
    FirebirdTransaction> {

    public context: FirebirdContext = new FirebirdContext();
    public handler?: Attachment;

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

        this.context.create();
        this.handler = await this.context.statusAction(async (status) => {
            const dpb = createDpb(options);
            return await this.context!.client!.dispatcher!.createDatabaseAsync(status,
                FirebirdConnection._optionsToUri(options), dpb.length, dpb);
        });
    }

    public async dropDatabase(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need database connection");
        }

        await this.context.statusAction((status) => this.handler!.dropDatabaseAsync(status));
        this.handler = undefined;
        this.context.destroy();
    }

    public async connect(options: FirebirdOptions): Promise<void> {
        if (this.handler) {
            throw new Error("Database already connected");
        }

        this.context.create();
        this.handler = await this.context.statusAction(async (status) => {
            const dpb = createDpb(options);
            return await this.context!.client!.dispatcher!.attachDatabaseAsync(status,
                FirebirdConnection._optionsToUri(options), dpb.length, dpb);
        });
    }

    public async createTransaction(options?: ITransactionOptions): Promise<FirebirdTransaction> {
        if (!this.handler) {
            throw new Error("Need database connection");
        }

        return await FirebirdTransaction.create(this, options);
    }

    public async disconnect(): Promise<void> {
        if (!this.handler) {
            throw new Error("Need database connection");
        }

        await this.context.statusAction((status) => this.handler!.detachAsync(status));
        this.handler = undefined;
        this.context.destroy();
    }

    public async isConnected(): Promise<boolean> {
        return Boolean(this.handler);
    }
}
