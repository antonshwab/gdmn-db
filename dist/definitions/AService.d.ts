import { IServiceOptions } from "./fb/Service";
export declare abstract class AService {
    abstract attach(options: IServiceOptions): Promise<void>;
    abstract detach(): Promise<void>;
    abstract backupDatabase(dbPath: string, backupPath: string): Promise<void>;
    abstract restoreDatabase(dbPath: string, backupPath: string): Promise<void>;
}
