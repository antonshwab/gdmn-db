import { Service as NativeService } from "node-firebird-native-api";
import { AService } from "../AService";
export interface IServiceOptions {
    username: string;
    password: string;
    host: string;
    port: number;
}
export declare class Service implements AService {
    svc?: NativeService;
    BUFFER_SIZE: number;
    private client;
    attach(options: IServiceOptions): Promise<void>;
    detach(): Promise<void>;
    backupDatabase(dbPath: string, backupPath: string): Promise<void>;
    restoreDatabase(dbPath: string, backupPath: string): Promise<void>;
    private executeServicesAction;
    private pollService;
    private getServiceInfo;
}
