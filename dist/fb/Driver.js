"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADriver_1 = require("../ADriver");
const Connection_1 = require("./Connection");
const DBStructureReader_1 = require("./DBStructureReader");
const Service_1 = require("./Service");
class Driver extends ADriver_1.ADriver {
    async readDBStructure(connection, transaction) {
        return await DBStructureReader_1.DBStructureReader.readStructure(connection, transaction);
    }
    newConnection() {
        return new Connection_1.Connection();
    }
    newService() {
        return new Service_1.Service();
    }
}
exports.Driver = Driver;
//# sourceMappingURL=Driver.js.map