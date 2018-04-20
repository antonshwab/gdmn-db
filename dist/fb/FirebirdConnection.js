"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {Attachment, Client, createNativeClient, getDefaultLibraryFilename} from "node-firebird-driver-native";
const AConnection_1 = require("../AConnection");
const client_1 = require("./api/client");
const FirebirdTransaction_1 = require("./FirebirdTransaction");
class FirebirdConnection extends AConnection_1.AConnection {
    constructor() {
        super();
        this._client = null;
        this._connection = null;
    }
    static _optionsToUri(options) {
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
    async createDatabase(options) {
        if (this._connection) {
            throw new Error("Database already connected");
        }
        this._client = client_1.createNativeClient(client_1.getDefaultLibraryFilename());
        this._connection = await this._client.createDatabase(FirebirdConnection._optionsToUri(options), {
            username: options.username,
            password: options.password
        });
    }
    async dropDatabase() {
        if (!this._connection || !this._client) {
            throw new Error("Need database connection");
        }
        await this._connection.dropDatabase();
        await this._client.dispose();
        this._clearVariables();
    }
    async connect(options) {
        if (this._connection) {
            throw new Error("Database already connected");
        }
        this._client = client_1.createNativeClient(client_1.getDefaultLibraryFilename());
        this._connection = await this._client.connect(FirebirdConnection._optionsToUri(options), {
            username: options.username,
            password: options.password
        });
    }
    async createTransaction(options) {
        if (!this._connection) {
            throw new Error("Need database connection");
        }
        return new FirebirdTransaction_1.FirebirdTransaction(this._connection, options);
    }
    async disconnect() {
        if (!this._connection || !this._client) {
            throw new Error("Need database connection");
        }
        await this._connection.disconnect();
        await this._client.dispose();
        this._clearVariables();
    }
    async isConnected() {
        return Boolean(this._connection);
    }
    _clearVariables() {
        this._connection = null;
        this._client = null;
    }
}
exports.FirebirdConnection = FirebirdConnection;
//# sourceMappingURL=FirebirdConnection.js.map