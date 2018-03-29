"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_firebird_driver_native_1 = require("node-firebird-driver-native");
const ADatabase_1 = require("../ADatabase");
const FirebirdTransaction2_1 = require("./FirebirdTransaction2");
class FirebirdDatabase2 extends ADatabase_1.ADatabase {
    constructor() {
        super();
    }
    async connect(options) {
        if (this._connect)
            throw new Error("Database already connected");
        let url = "";
        if (options.host)
            url += options.host;
        if (options.port)
            url += `/${options.port}`;
        if (url)
            url += ":";
        url += options.dbPath;
        this._connect = await node_firebird_driver_native_1.createNativeClient(node_firebird_driver_native_1.getDefaultLibraryFilename()).connect(url, {
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
        if (!this._connect)
            throw new Error("Need database connection");
        await this._connect.disconnect();
        this._connect = null;
    }
    async isConnected() {
        return Boolean(this._connect);
    }
}
exports.FirebirdDatabase2 = FirebirdDatabase2;
//# sourceMappingURL=FirebirdDatabase2.js.map