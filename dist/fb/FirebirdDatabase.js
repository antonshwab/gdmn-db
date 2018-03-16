"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const ADatabase_1 = require("../ADatabase");
const FBDatabase_1 = __importDefault(require("./FBDatabase"));
const FirebirdTransaction_1 = require("./FirebirdTransaction");
class FirebirdDatabase extends ADatabase_1.ADatabase {
    constructor() {
        super(...arguments);
        this._database = new FBDatabase_1.default();
    }
    async connect(options) {
        return await this._database.attach(options);
    }
    async createTransaction() {
        return new FirebirdTransaction_1.FirebirdTransaction(this._database);
    }
    async disconnect() {
        return await this._database.detach();
    }
    async isConnected() {
        return this._database.isAttached();
    }
}
exports.FirebirdDatabase = FirebirdDatabase;
//# sourceMappingURL=FirebirdDatabase.js.map