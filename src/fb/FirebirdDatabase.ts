import {Attachment, Client, createNativeClient, getDefaultLibraryFilename} from "node-firebird-driver-native";
import {ADatabase, TDBOptions} from "../ADatabase";
import {FirebirdTransaction} from "./FirebirdTransaction";
import {FirebirdStatement} from "./FirebirdStatement";
import {FirebirdResultSet} from "./FirebirdResultSet";
import {ITransactionOptions} from "../ATransaction";

export type FirebirdOptions = TDBOptions;

export class FirebirdDatabase extends ADatabase<FirebirdOptions, FirebirdResultSet, FirebirdStatement,
    FirebirdTransaction> {

    private _client: null | Client = null;
    private _connect: null | Attachment = null;

    constructor() {
        super();
    }

    private static _optionsToUri(options: FirebirdOptions): string {
        let url = "";
        if (options.host) url += options.host;
        if (options.port) url += `/${options.port}`;
        if (url) url += ":";
        url += options.path;
        return url;
    }

    async createDatabase(options: FirebirdOptions): Promise<void> {
        if (this._connect) throw new Error("Database already connected");

        this._client = createNativeClient(getDefaultLibraryFilename());
        this._connect = await this._client.createDatabase(FirebirdDatabase._optionsToUri(options), {
            username: options.username,
            password: options.password
        });
    }

    async dropDatabase(): Promise<void> {
        if (!this._connect || !this._client) throw new Error("Need database connection");

        await this._connect.dropDatabase();
        await this._client.dispose();
        this._clearVariables();
    }

    async connect(options: FirebirdOptions): Promise<void> {
        if (this._connect) throw new Error("Database already connected");

        this._client = createNativeClient(getDefaultLibraryFilename());
        this._connect = await this._client.connect(FirebirdDatabase._optionsToUri(options), {
            username: options.username,
            password: options.password
        });
    }

    async createTransaction(options?: ITransactionOptions): Promise<FirebirdTransaction> {
        if (!this._connect) throw new Error("Need database connection");

        return new FirebirdTransaction(this._connect, options);
    }

    async disconnect(): Promise<void> {
        if (!this._connect || !this._client) throw new Error("Need database connection");

        await this._connect.disconnect();
        await this._client.dispose();
        this._clearVariables();
    }

    async isConnected(): Promise<boolean> {
        return Boolean(this._connect);
    }

    private _clearVariables() {
        this._connect = null;
        this._client = null;
    }
}