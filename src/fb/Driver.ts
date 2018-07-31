import {AConnection, IConnectionOptions} from "../AConnection";
import {ADriver} from "../ADriver";
import {DBStructure} from "../DBStructure";
import {Connection} from "./Connection";
import {DBStructureReader} from "./DBStructureReader";
import {Transaction} from "./Transaction";
import { Service } from "./Service";

export class Driver extends ADriver {

    public async readDBStructure(connection: Connection, transaction: Transaction): Promise<DBStructure> {
        return await DBStructureReader.readStructure(connection, transaction);
    }

    public newConnection(): AConnection {
        return new Connection();
    }

    public newService(): Service {
        return new Service();
    }
}
