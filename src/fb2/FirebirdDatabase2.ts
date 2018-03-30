import {Attachment, Client, createNativeClient, getDefaultLibraryFilename} from "node-firebird-driver-native";
import {ADatabase} from "../ADatabase";
import {FirebirdTransaction2} from "./FirebirdTransaction2";
import {FirebirdResultSet2} from "./FirebirdResultSet2";

export type FirebirdOptions2 = {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    dbPath: string;
}

export class FirebirdDatabase2 extends ADatabase<FirebirdOptions2, FirebirdResultSet2, FirebirdTransaction2> {

    private _client: Client;
    private _connect: Attachment;

    constructor() {
        super();
    }

    private static _optionsToUri(options: FirebirdOptions2): string {
        let url = "";
        if (options.host) url += options.host;
        if (options.port) url += `/${options.port}`;
        if (url) url += ":";
        url += options.dbPath;
        return url;
    }

    async createDatabase(options: FirebirdOptions2): Promise<void> {
        if (this._connect) throw new Error("Database already connected");

        this._client = createNativeClient(getDefaultLibraryFilename());
        this._connect = await this._client.createDatabase(FirebirdDatabase2._optionsToUri(options), {
            username: options.username,
            password: options.password
        });
    }

    async dropDatabase(): Promise<void> {
        if (!this._connect) throw new Error("Need database connection");

        await this._connect.dropDatabase();
        await this._client.dispose();
        this._clearVariables();
    }

    async connect(options: FirebirdOptions2): Promise<void> {
        if (this._connect) throw new Error("Database already connected");

        this._client = createNativeClient(getDefaultLibraryFilename());
        this._connect = await this._client.connect(FirebirdDatabase2._optionsToUri(options), {
            username: options.username,
            password: options.password
        });
    }

    async createTransaction(): Promise<FirebirdTransaction2> {
        if (!this._connect) throw new Error("Need database connection");

        return new FirebirdTransaction2(this._connect);
    }

    async disconnect(): Promise<void> {
        if (!this._connect) throw new Error("Need database connection");

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