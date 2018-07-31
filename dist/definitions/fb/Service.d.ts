import { Service as NativeService } from "node-firebird-native-api";
import { IConnectionOptions } from "../AConnection";
import { AService } from "../AService";
export declare class Service implements AService {
    svc?: NativeService;
    BUFFER_SIZE: number;
    private client;
    attachService(options: IConnectionOptions): Promise<void>;
    detachService(): Promise<void>;
    backupDatabase(dbPath: string, backupPath: string): Promise<void>;
    restoreDatabase(dbPath: string, backupPath: string): Promise<void>;
    private executeServicesAction;
    private pollService;
    private getServiceInfo;
}
