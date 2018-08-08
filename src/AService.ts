import { IServiceOptions } from "./fb/Service";

export interface IRestoreOptions {
    replace?: boolean;
}

export abstract class AService {

    public abstract async attach(options: IServiceOptions): Promise<void>;

    public abstract async detach(): Promise<void>;

    public abstract async backupDatabase(dbPath: string, backupPath: string): Promise<void>;

    public abstract async restoreDatabase(dbPath: string, backupPath: string, options?: IRestoreOptions): Promise<void>;
}
