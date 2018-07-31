"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timers_1 = require("timers");
const Client_1 = require("./Client");
const constants_1 = require("./utils/constants");
const fb_utils_1 = require("./utils/fb-utils");
const createServiceAttachmentBuffer = (svcOptions, util, status) => {
    const svcAttachB = (util.getXpbBuilderSync(status, constants_1.XpbBuilderParams.SPB_ATTACH, undefined, 0));
    svcAttachB.insertStringSync(status, constants_1.isc_spb.user_name, svcOptions.user || "sysdba");
    svcAttachB.insertStringSync(status, constants_1.isc_spb.password, svcOptions.password || "masterkey");
    svcAttachB.insertStringSync(status, constants_1.isc_spb.expected_db, svcOptions.dbPath);
    return svcAttachB;
};
const createServiceRequestBuffer = (status, util) => {
    return (util.getXpbBuilderSync(status, constants_1.XpbBuilderParams.SPB_START, undefined, 0));
};
class Service {
    constructor() {
        this.BUFFER_SIZE = 1024;
        this.client = new Client_1.Client();
    }
    async attachService(options) {
        if (this.svc) {
            throw new Error("Service already attached");
        }
        await this.client.create();
        const util = this.client.client.util;
        this.svc = await this.client.statusAction(async (status) => {
            const attachSpb = createServiceAttachmentBuffer(options, util, status);
            return await this.client.client.dispatcher.attachServiceManagerAsync(status, "service_mgr", attachSpb.getBufferLengthSync(status), attachSpb.getBufferSync(status));
        });
    }
    async detachService() {
        if (!this.svc) {
            throw new Error("Service already detached");
        }
        await this.client.statusAction(async (status) => {
            await this.svc.detachAsync(status);
        });
        await this.client.destroy();
    }
    async backupDatabase(dbPath, backupPath) {
        if (!this.svc) {
            throw new Error("Need attached Service");
        }
        const util = this.client.client.util;
        await this.client.statusAction(async (status) => {
            const srb = createServiceRequestBuffer(status, util);
            srb.insertTagSync(status, constants_1.isc_action_svc.backup);
            srb.insertStringSync(status, constants_1.isc_spb.dbname, dbPath);
            srb.insertStringSync(status, constants_1.isc_spb_bkp.file, backupPath);
            await this.executeServicesAction(srb);
        });
    }
    async restoreDatabase(dbPath, backupPath) {
        if (!this.svc) {
            throw new Error("Need attached Service");
        }
        const util = this.client.client.util;
        await this.client.statusAction(async (status) => {
            const srb = createServiceRequestBuffer(status, util);
            srb.insertTagSync(status, constants_1.isc_action_svc.restore);
            srb.insertStringSync(status, constants_1.isc_spb.dbname, dbPath);
            srb.insertStringSync(status, constants_1.isc_spb_bkp.file, backupPath);
            await this.executeServicesAction(srb);
        });
    }
    async executeServicesAction(srb) {
        await this.client.statusAction(async (status) => {
            await this.svc.startAsync(status, srb.getBufferLengthSync(status), srb.getBufferSync(status));
        });
        await this.pollService();
    }
    async pollService() {
        const util = this.client.client.util;
        await this.client.statusAction(async (status) => {
            const infoSRB = createServiceRequestBuffer(status, util);
            infoSRB.insertTagSync(status, constants_1.isc_info_svc.to_eof);
            let bufferSize = this.BUFFER_SIZE;
            let processing = true;
            while (processing) {
                await new Promise((resolve) => timers_1.setTimeout(resolve, 100));
                const buffer = await this.getServiceInfo(bufferSize, undefined, infoSRB);
                switch (buffer[0]) {
                    case constants_1.isc_info_svc.to_eof:
                        const dataLength = fb_utils_1.iscVaxInteger2(buffer, 1);
                        if (dataLength === 0) {
                            if (buffer[3] !== constants_1.isc_info.end) {
                                throw new Error("Unexpected end of stream reached.");
                            }
                            else {
                                processing = false;
                                break;
                            }
                        }
                        break;
                    case constants_1.isc_info.truncated:
                        bufferSize = bufferSize * 2;
                        break;
                    case constants_1.isc_info.end:
                        processing = false;
                        break;
                }
            }
        });
    }
    async getServiceInfo(maxBufferLength, spb, srb) {
        const responseBuffer = Buffer.alloc(maxBufferLength);
        await this.client.statusAction(async (status) => {
            await this.svc.queryAsync(status, spb === undefined ? 0 : spb.getBufferLengthSync(status), spb === undefined ? undefined : spb.getBufferSync(status), srb === undefined ? 0 : srb.getBufferLengthSync(status), srb === undefined ? undefined : srb.getBufferSync(status), responseBuffer.byteLength, responseBuffer);
        });
        return responseBuffer;
    }
}
exports.Service = Service;
//# sourceMappingURL=Service.js.map