import {
    Util,
    XpbBuilder, Status,
    Service as NativeService,
} from "node-firebird-native-api";
import { isc_spb, isc_info_svc, isc_info, isc_spb_bkp, isc_action_svc, XpbBuilderParams } from "./utils/constants";
import { IConnectionOptions } from "../AConnection";
import { AService } from "../AService";
import { iscVaxInteger2 } from "./utils/fb-utils";
import { Client } from "./Client";
import { setTimeout } from "timers";

interface IServiceOptions {
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    dbPath?: string;
}

type ServiceRequestBuffer = XpbBuilder;
type ServiceParameterBuffer = XpbBuilder;

const createServiceAttachmentBuffer = (svcOptions: IServiceOptions, util: Util, status: Status): XpbBuilder => {
    const svcAttachB = (util.getXpbBuilderSync(status, XpbBuilderParams.SPB_ATTACH, undefined, 0))!;
    svcAttachB.insertStringSync(status, isc_spb.user_name, svcOptions.user || "sysdba");
    svcAttachB.insertStringSync(status, isc_spb.password, svcOptions.password || "masterkey");
    svcAttachB.insertStringSync(status, isc_spb.expected_db, svcOptions.dbPath);
    return svcAttachB;
};

const createServiceRequestBuffer = (status: Status, util: Util): XpbBuilder => {
    const srb = (util.getXpbBuilderSync(status, XpbBuilderParams.SPB_START, undefined, 0))!;
    return srb;
};

export class Service implements AService {

    public svc?: NativeService;
    public BUFFER_SIZE = 1024;

    private client = new Client();

    public async attachService(options: IConnectionOptions): Promise<void> {
        if (this.svc) {
            throw new Error("Servcie already attached");
        }

        await this.client.create();

        const util = this.client.client!.util;
        this.svc = await this.client.statusAction(async (status) => {
            const attachSpb = createServiceAttachmentBuffer(options as IServiceOptions, util, status);
            return await this.client.client!.dispatcher!.attachServiceManagerAsync(
                status,
                "service_mgr",
                attachSpb.getBufferLengthSync(status),
                attachSpb.getBufferSync(status)
            );
        });
    }

    public async detachService(): Promise<void> {
        if (!this.svc) {
            throw new Error("Service already dettached");
        }

        try {
            await this.client.statusAction(async (status) => {
                await this.svc!.detachAsync(status);
            });
            await this.client.destroy();
        } catch (error) {
            throw error;
        }
    }

    public async backupDatabase(dbPath: string, backupPath: string): Promise<void> {
        if (!this.svc) {
            throw new Error("Need attached Service");
        }
        const util = this.client.client!.util;
        try {
            await this.client.statusAction(async (status) => {
                const srb = createServiceRequestBuffer(status, util);
                srb.insertTagSync(status, isc_action_svc.backup);
                srb.insertStringSync(status, isc_spb.dbname, dbPath);
                srb.insertStringSync(status, isc_spb_bkp.file, backupPath);
                await this.executeServicesAction(srb);
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public async restoreDatabase(dbPath: string, backupPath: string): Promise<void> {
        if (!this.svc) {
            throw new Error("Need attached Service");
        }
        const util = this.client.client!.util;
        try {
            await this.client.statusAction(async (status) => {
                const srb = createServiceRequestBuffer(status, util);
                srb.insertTagSync(status, isc_action_svc.restore);
                srb.insertStringSync(status, isc_spb.dbname, dbPath);
                srb.insertStringSync(status, isc_spb_bkp.file, backupPath);
                await this.executeServicesAction(srb);
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    private async executeServicesAction(srb: ServiceRequestBuffer): Promise<void> {
        try {
            await this.client.statusAction(async (status) => {
                await this.svc!.startAsync(status, srb.getBufferLengthSync(status)!, srb.getBufferSync(status)!);
            });
            await this.pollService();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    private async pollService(): Promise<void> {
        const util = this.client.client!.util;
        try {
            await this.client.statusAction(async (status) => {
                const infoSRB = createServiceRequestBuffer(status, util);
                infoSRB.insertTagSync(status, isc_info_svc.to_eof);

                let bufferSize = this.BUFFER_SIZE;

                let processing = true;
                while (processing) {
                    await new Promise((resolve) => setTimeout(resolve, 100));

                    const buffer = await this.getServiceInfo(bufferSize, undefined, infoSRB);

                    switch (buffer[0]) {
                        case isc_info_svc.to_eof:
                            const dataLength = iscVaxInteger2(buffer, 1);
                            if (dataLength === 0) {
                                if (buffer[3] !== isc_info.end) {
                                    throw new Error("Unexpected end of stream reached.");
                                } else {
                                    processing = false;
                                    break;
                                }
                            }
                            break;

                        case isc_info.truncated:
                            bufferSize = bufferSize * 2;
                            break;
                        case isc_info.end:
                            processing = false;
                            break;

                    }
                }
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    private async getServiceInfo(
        maxBufferLength: number,
        spb?: ServiceParameterBuffer,
        srb?: ServiceRequestBuffer,
    ): Promise<Buffer> {
        try {
            const responseBuffer = Buffer.alloc(maxBufferLength);

            await this.client.statusAction(async (status) => {
                await this.svc!.queryAsync(status,
                    spb === undefined ? 0 : spb.getBufferLengthSync(status),
                    spb === undefined ? undefined : spb.getBufferSync(status),
                    srb === undefined ? 0 : srb.getBufferLengthSync(status),
                    srb === undefined ? undefined : srb.getBufferSync(status),
                    responseBuffer.byteLength,
                    responseBuffer
                );
            });

            return responseBuffer;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}
