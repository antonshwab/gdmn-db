import * as fb from "node-firebird-native-api";
import {Attachment} from "./attachment";
import {ConnectOptions} from "./types";

export const getDefaultLibraryFilename = fb.getDefaultLibraryFilename;

/** Creates a client for a given library filename. */
export function createNativeClient(library: string): Client {
    return new Client(library);
}

/** Client implementation. */
export class Client {

    public connected = true;
    public attachments = new Set<Attachment>();

    public master?: fb.Master;
    public dispatcher?: fb.Provider;
    public util?: fb.Util;

    constructor(library: string) {
        this.master = fb.getMaster(library);
        this.dispatcher = this.master.getDispatcherSync();
        this.util = this.master.getUtilInterfaceSync();
    }

    public async statusAction<T>(action: (status: fb.Status) => Promise<T>): Promise<T> {
        const status = this.master!.getStatusSync()!;
        try {
            return await action(status);
        } finally {
            status.disposeSync();
        }
    }

    /** Disposes this client's resources. */
    public async dispose(): Promise<void> {
        if (!this.connected) {
            throw new Error("Client is already disposed.");
        }

        try {
            await Promise.all(Array.from(this.attachments).map((attachment) => attachment.disconnect()));
        } finally {
            this.attachments.clear();
        }

        await this.statusAction(async (status) => {
            await this.dispatcher!.shutdownAsync(status, 0, -3);
        });

        this.dispatcher!.releaseSync();
        fb.disposeMaster(this.master!);

        this.util = undefined;
        this.dispatcher = undefined;
        this.master = undefined;

        this.connected = false;
    }

    /** Connects to a database. */
    public async connect(uri: string, options?: ConnectOptions): Promise<Attachment> {
        if (!this.connected) {
            throw new Error("Client is already disposed.");
        }

        const attachment = await Attachment.connect(this, uri, options);
        this.attachments.add(attachment);
        return attachment;
    }

    /** Creates a database. */
    public async createDatabase(uri: string, options?: ConnectOptions): Promise<Attachment> {
        if (!this.connected) {
            throw new Error("Client is already disposed.");
        }

        const attachment = await Attachment.createDatabase(this, uri, options);
        this.attachments.add(attachment);
        return attachment;
    }
}
