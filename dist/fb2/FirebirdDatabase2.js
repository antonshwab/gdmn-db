"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_driver_native_1 = require("node-firebird-driver-native");
const ADatabase_1 = require("../ADatabase");
const FirebirdTransaction2_1 = require("./FirebirdTransaction2");
class FirebirdDatabase2 extends ADatabase_1.ADatabase {
    constructor() {
        super();
        this._client = null;
        this._connect = null;
    }
    static _optionsToUri(options) {
        let url = "";
        if (options.host)
            url += options.host;
        if (options.port)
            url += `/${options.port}`;
        if (url)
            url += ":";
        url += options.dbPath;
        return url;
    }
    async createDatabase(options) {
        if (this._connect)
            throw new Error("Database already connected");
        this._client = node_firebird_driver_native_1.createNativeClient(node_firebird_driver_native_1.getDefaultLibraryFilename());
        this._connect = await this._client.createDatabase(FirebirdDatabase2._optionsToUri(options), {
            username: options.username,
            password: options.password
        });
    }
    async dropDatabase() {
        if (!this._connect || !this._client)
            throw new Error("Need database connection");
        await this._connect.dropDatabase();
        await this._client.dispose();
        this._clearVariables();
    }
    async connect(options) {
        if (this._connect)
            throw new Error("Database already connected");
        this._client = node_firebird_driver_native_1.createNativeClient(node_firebird_driver_native_1.getDefaultLibraryFilename());
        this._connect = await this._client.connect(FirebirdDatabase2._optionsToUri(options), {
            username: options.username,
            password: options.password
        });
    }
    async createTransaction() {
        if (!this._connect)
            throw new Error("Need database connection");
        return new FirebirdTransaction2_1.FirebirdTransaction2(this._connect);
    }
    async disconnect() {
        if (!this._connect || !this._client)
            throw new Error("Need database connection");
        await this._connect.disconnect();
        await this._client.dispose();
        this._clearVariables();
    }
    async isConnected() {
        return Boolean(this._connect);
    }
    _clearVariables() {
        this._connect = null;
        this._client = null;
    }
}
exports.FirebirdDatabase2 = FirebirdDatabase2;
//# sourceMappingURL=FirebirdDatabase2.js.map