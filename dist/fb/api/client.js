"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fb = __importStar(require("node-firebird-native-api"));
const attachment_1 = require("./attachment");
exports.getDefaultLibraryFilename = fb.getDefaultLibraryFilename;
/** Creates a client for a given library filename. */
function createNativeClient(library) {
    return new Client(library);
}
exports.createNativeClient = createNativeClient;
/** Client implementation. */
class Client {
    constructor(library) {
        this.connected = true;
        this.attachments = new Set();
        this.master = fb.getMaster(library);
        this.dispatcher = this.master.getDispatcherSync();
        this.util = this.master.getUtilInterfaceSync();
    }
    async statusAction(action) {
        const status = this.master.getStatusSync();
        try {
            return await action(status);
        }
        finally {
            status.disposeSync();
        }
    }
    /** Disposes this client's resources. */
    async dispose() {
        if (!this.connected) {
            throw new Error("Client is already disposed.");
        }
        try {
            await Promise.all(Array.from(this.attachments).map((attachment) => attachment.disconnect()));
        }
        finally {
            this.attachments.clear();
        }
        await this.statusAction(async (status) => {
            await this.dispatcher.shutdownAsync(status, 0, -3);
        });
        this.dispatcher.releaseSync();
        fb.disposeMaster(this.master);
        this.util = undefined;
        this.dispatcher = undefined;
        this.master = undefined;
        this.connected = false;
    }
    /** Connects to a database. */
    async connect(uri, options) {
        if (!this.connected) {
            throw new Error("Client is already disposed.");
        }
        const attachment = await attachment_1.Attachment.connect(this, uri, options);
        this.attachments.add(attachment);
        return attachment;
    }
    /** Creates a database. */
    async createDatabase(uri, options) {
        if (!this.connected) {
            throw new Error("Client is already disposed.");
        }
        const attachment = await attachment_1.Attachment.createDatabase(this, uri, options);
        this.attachments.add(attachment);
        return attachment;
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map