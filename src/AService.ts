import {IConnectionOptions} from "./AConnection";

export abstract class AService {

    public abstract async attachService(options: IConnectionOptions): Promise<void>;

    public abstract async detachService(): Promise<void>;

    public abstract async backupDatabase(dbPath: string, backupPath: string): Promise<void>;

    public abstract async restoreDatabase(dbPath: string, backupPath: string): Promise<void>;
}
