import {Attachment, Client, createNativeClient, getDefaultLibraryFilename} from "node-firebird-driver-native";
import {AConnection, IConnectionOptions} from "../AConnection";
import {ITransactionOptions} from "../ATransaction";
import {FirebirdBlob} from "./FirebirdBlob";
import {FirebirdResultSet} from "./FirebirdResultSet";
import {FirebirdStatement} from "./FirebirdStatement";
import {FirebirdTransaction} from "./FirebirdTransaction";

export type FirebirdOptions = IConnectionOptions;

export class FirebirdConnection extends AConnection<FirebirdOptions, FirebirdBlob, FirebirdResultSet, FirebirdStatement,
    FirebirdTransaction> {

    private _client: null | Client = null;
    private _connection: null | Attachment = null;

    constructor() {
        super();
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
        if (this._connection) {
            throw new Error("Database already connected");
        }

        this._client = createNativeClient(getDefaultLibraryFilename());
        this._connection = await this._client.createDatabase(FirebirdConnection._optionsToUri(options), {
            username: options.username,
            password: options.password
        });
    }

    public async dropDatabase(): Promise<void> {
        if (!this._connection || !this._client) {
            throw new Error("Need database connection");
        }

        await this._connection.dropDatabase();
        await this._client.dispose();
        this._clearVariables();
    }

    public async connect(options: FirebirdOptions): Promise<void> {
        if (this._connection) {
            throw new Error("Database already connected");
        }

        this._client = createNativeClient(getDefaultLibraryFilename());
        this._connection = await this._client.connect(FirebirdConnection._optionsToUri(options), {
            username: options.username,
            password: options.password
        });
    }

    public async createTransaction(options?: ITransactionOptions): Promise<FirebirdTransaction> {
        if (!this._connection) {
            throw new Error("Need database connection");
        }

        return new FirebirdTransaction(this._connection, options);
    }

    public async disconnect(): Promise<void> {
        if (!this._connection || !this._client) {
            throw new Error("Need database connection");
        }

        await this._connection.disconnect();
        await this._client.dispose();
        this._clearVariables();
    }

    public async isConnected(): Promise<boolean> {
        return Boolean(this._connection);
    }

    private _clearVariables(): void {
        this._connection = null;
        this._client = null;
    }
}
