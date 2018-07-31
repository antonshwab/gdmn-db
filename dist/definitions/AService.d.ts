import { IConnectionOptions } from "./AConnection";
export declare abstract class AService {
    abstract attachService(options: IConnectionOptions): Promise<void>;
    abstract detachService(): Promise<void>;
    abstract backupDatabase(dbPath: string, backupPath: string): Promise<void>;
    abstract restoreDatabase(dbPath: string, backupPath: string): Promise<void>;
}
