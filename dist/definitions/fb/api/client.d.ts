import * as fb from "node-firebird-native-api";
import { Attachment } from "./attachment";
import { ConnectOptions } from "./types";
export declare const getDefaultLibraryFilename: typeof fb.getDefaultLibraryFilename;
/** Creates a client for a given library filename. */
export declare function createNativeClient(library: string): Client;
/** Client implementation. */
export declare class Client {
    connected: boolean;
    attachments: Set<Attachment>;
    master?: fb.Master;
    dispatcher?: fb.Provider;
    util?: fb.Util;
    constructor(library: string);
    statusAction<T>(action: (status: fb.Status) => Promise<T>): Promise<T>;
    /** Disposes this client's resources. */
    dispose(): Promise<void>;
    /** Connects to a database. */
    connect(uri: string, options?: ConnectOptions): Promise<Attachment>;
    /** Creates a database. */
    createDatabase(uri: string, options?: ConnectOptions): Promise<Attachment>;
}
